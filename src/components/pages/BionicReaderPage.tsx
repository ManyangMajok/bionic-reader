import { BionicReaderProvider } from "../../context/BionicReaderContext";
import { BionicReaderLayout } from "../../components/BionicReader/BionicReaderLayout";

export default function BionicReaderPage() {
  return (
    <BionicReaderProvider>
      <BionicReaderLayout />
    </BionicReaderProvider>
  );
}