import { ChevronLeft } from "lucide-react";

export default function RetourArriere({ clique }: { clique: () => void }) {
    return (
        <div className="boutonRetourArriere" onClick={clique}>
            <ChevronLeft size={30} />
        </div>
    );
}
