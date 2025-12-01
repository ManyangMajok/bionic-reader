import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Always redirect to bionic reader after login
      navigate("/bionic-reader");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 sm:h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors mobile-tap-target"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 sm:h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 rounded-full bg-black text-white hover:bg-gray-800 text-sm sm:text-base font-medium mobile-tap-target transition-colors"
          >
            Sign in
          </Button>

          <div className="text-sm text-center text-gray-600 mt-4 sm:mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-medium mobile-tap-target transition-colors"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
