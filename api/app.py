import fitz  # PyMuPDF
import io
import os
import wave
import struct
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from weasyprint import HTML, CSS
from dotenv import load_dotenv
import google.generativeai as genai
import re

# Load environment variables from .env file (for GOOGLE_API_KEY)
load_dotenv()

# --- NEW: Configure Google AI ---
# Fetches the API key from your api/.env file
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: GOOGLE_API_KEY not set in .env file. Summarize and TTS features will fail.")
else:
    genai.configure(api_key=api_key)
# ------------------------------

# Initialize Flask App
app = Flask(__name__)

# --- UPDATED: Secure CORS ---
# This is more secure than "CORS(app)".
# It only allows requests to your API routes, and in production,
# you can change "*" to your specific website URL.
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- NEW: Helper function to convert raw PCM audio to playable WAV ---
# The Gemini TTS API returns raw audio data (L16 PCM).
# This function wraps it in a WAV file header so browsers can play it.
def _pcm_to_wav(pcm_data, sample_rate=24000, channels=1, sample_width=2):
    """Converts raw PCM data to WAV format in memory."""
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)  # 2 bytes = 16-bit audio
        wf.setframerate(sample_rate)
        
        # The Gemini API returns signed 16-bit PCM.
        # This line ensures it's packed correctly for the WAV file.
        pcm_array = struct.unpack(f'<{len(pcm_data)//2}h', pcm_data)
        wf.writeframes(struct.pack(f'<{len(pcm_array)}h', *pcm_array))
        
    wav_buffer.seek(0)
    return wav_buffer.read()
# -------------------------------------------------------------------

@app.route("/")
def home():
    """A simple route to check if the server is alive."""
    return "Python API Backend is running!"

@app.route("/api/extract-pdf", methods=["POST"])
def extract_pdf():
    """
    Extracts plain text from an uploaded PDF file.
    (This is your existing function, slightly improved for error handling)
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Read the file stream in-memory
        pdf_stream = file.read()
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        
        doc.close()
        
        if not full_text.strip():
            return jsonify({"error": "No text content found in PDF"}), 400

        return jsonify({"text": full_text})

    except Exception as e:
        print(f"Error extracting PDF: {e}")
        # Check if it's a fitz error (e.g., corrupt file)
        if "cannot open" in str(e):
             return jsonify({"error": "Failed to open PDF. File may be corrupt or password-protected."}), 400
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    """
    Generates a PDF from the bionic-reading HTML string.
    --- UPDATED ---
    This now receives style information from your React app
    to make the PDF exactly match the on-screen preview.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' in request"}), 400

        html_content = data['text']
        filename = data.get('filename', 'processed') # Use .get for safety
        
        # Get dynamic styles from React or use defaults
        line_spacing = data.get('lineSpacing', 1.5)
        font_size = data.get('textSize', 16)
        letter_spacing = data.get('letterSpacing', 0)

        # We wrap the incoming HTML in a full document and apply
        # the exact styles from your React app's reading settings.
        html_wrapper = f"""
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                
                @page {{ margin: 2cm; }}
                body {{
                    font-family: 'Inter', sans-serif;
                    line-height: {line_spacing};
                    font-size: {font_size}px;
                    letter-spacing: {letter_spacing}px;
                    color: #374151;
                }}
                strong {{
                    font-weight: 700;
                    color: #000;
                }}
                /* These classes match your React app's output */
                .text-lg {{ font-size: 1.125rem; }}
                .font-semibold {{ font-weight: 600; }}
                .text-gray-800 {{ color: #1f2937; }}
                .mb-2 {{ margin-bottom: 0.5rem; }}
                .mt-4 {{ margin-top: 1rem; }}
                .ml-4 {{ margin-left: 1rem; }}
                .mb-1 {{ margin-bottom: 0.25rem; }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """
        
        # Render the PDF from the HTML string
        pdf_bytes = HTML(string=html_wrapper).write_pdf()
        
        return send_file(
            io.BytesIO(pdf_bytes),
            as_attachment=True,
            download_name=f"bionic-{filename}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({"error": str(e)}), 500

# --- NEW: AI Summarization Route ---
@app.route("/api/summarize", methods=['POST'])
def summarize_text():
    """
    Generates a summary of the provided text using the Gemini API.
    """
    if not api_key:
        return jsonify({"error": "Google AI API key not configured"}), 500
    try:
        data = request.get_json()
        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Initialize the Gemini model
        model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
        prompt = f"Summarize the following document in a few concise bullet points:\n\n---\n\n{text}"
        
        response = model.generate_content(prompt)
        
        return jsonify({"summary": response.text})
    except Exception as e:
        print(f"Error in /api/summarize: {e}")
        return jsonify({"error": str(e)}), 500
# ---------------------------------

# --- NEW: Text-to-Speech (TTS) Route ---
@app.route("/api/generate-speech", methods=['POST'])
def generate_speech():
    """
    Generates speech from the provided text using the Gemini TTS API.
    """
    if not api_key:
        return jsonify({"error": "Google AI API key not configured"}), 500
    try:
        data = request.get_json()
        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Truncate text to avoid overly long audio generation
        max_length = 4000
        if len(text) > max_length:
            text = text[:max_length] + "... (text truncated)"

        # Use the Gemini TTS model
        tts_model = genai.GenerativeModel('gemini-2.5-flash-preview-tts')
        tts_prompt = f"Say this in a clear, professional, American accent: {text}"
        
        response = tts_model.generate_content(
            tts_prompt,
            generation_config={"response_modalities": ["AUDIO"]}
        )
        
        # Extract the raw PCM audio data
        pcm_data = response.candidates[0].content.parts[0].inline_data.data
        
        # Convert the raw PCM to a playable WAV file
        wav_data = _pcm_to_wav(pcm_data)
        
        return send_file(
            io.BytesIO(wav_data),
            mimetype='audio/wav',
            as_attachment=False, # Set to False to allow browser streaming
            download_name="speech.wav"
        )
    except Exception as e:
        print(f"Error in /api/generate-speech: {e}")
        return jsonify({"error": str(e)}), 500
# -------------------------------------

# --- NEW: Chat with Document Route ---
@app.route("/api/chat", methods=['POST'])
def chat_with_document():
    """
    Allows the user to ask questions about the document.
    """
    if not api_key:
        return jsonify({"error": "Google AI API key not configured"}), 500
    try:
        data = request.get_json()
        context_text = data.get('context', '')
        user_question = data.get('question', '')
        # Optional: history could be passed here to maintain conversation context
        
        if not context_text or not user_question:
            return jsonify({"error": "Missing context or question"}), 400

        # Limit context to avoid token limits (approx 30k chars is safe for Flash)
        if len(context_text) > 30000:
            context_text = context_text[:30000] + "...(truncated)"

        model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
        
        # System Prompt engineering
        system_prompt = f"""
        You are a helpful AI teaching assistant. 
        You are provided with a document text below. 
        Answer the user's question based ONLY on that text.
        If the answer is not in the text, say "I couldn't find that information in the document."
        Keep answers concise and helpful.

        DOCUMENT CONTEXT:
        {context_text}

        USER QUESTION:
        {user_question}
        """
        
        response = model.generate_content(system_prompt)
        
        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({"error": str(e)}), 500
    
    # --- NEW: Mind Map Route ---
@app.route("/api/generate-mindmap", methods=['POST'])
def generate_mindmap():
    if not api_key:
        return jsonify({"error": "Google AI API key not configured"}), 500
    try:
        data = request.get_json()
        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Use the model we know works
        model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
        
        prompt = f"""
        Create a text-based flowchart using Mermaid.js syntax for the following text.
        
        STRICT RULES:
        1. Start strictly with 'graph TD'.
        2. Use standard nodes: A[Topic] --> B(Subtopic).
        3. Do NOT use brackets within node labels (e.g., avoid [Text (Extra)]).
        4. Do NOT use Markdown formatting (no ```mermaid or ```).
        5. Return ONLY the code. No text before or after.
        
        TEXT:
        {text[:8000]} 
        """
        
        response = model.generate_content(prompt)
        raw_text = response.text

        # --- NEW: Robust Cleanup Logic ---
        # 1. Remove markdown code blocks
        clean_code = raw_text.replace('```mermaid', '').replace('```', '')
        
        # 2. Find where the graph actually starts (ignore "Here is the code:" text)
        # We look for 'graph TD' or 'graph LR'
        match = re.search(r'graph [A-Z]{2}', clean_code)
        if match:
            start_index = match.start()
            clean_code = clean_code[start_index:]
            
        # 3. Strip whitespace
        clean_code = clean_code.strip()
        # ---------------------------------
        
        print(f"Generated Mermaid Code:\n{clean_code}") # Log to terminal for debugging
        
        return jsonify({"mermaidCode": clean_code})
    except Exception as e:
        print(f"Error in /api/generate-mindmap: {e}")
        return jsonify({"error": str(e)}), 500


# --- UPDATED: Run with a production server (Waitress) ---
if __name__ == "__main__":
    from waitress import serve
    print("--- Starting Python Backend (Production Mode) ---")
    print("--- Listening on http://127.0.0.1:5000 ---")
    # We use waitress instead of app.run(debug=True)
    # host='0.0.0.0' allows it to receive requests from your React app
    serve(app, host='0.0.0.0', port=5000)