import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize scanner
        // Use a slight delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (!document.getElementById('reader')) return;

            try {
                scannerRef.current = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scannerRef.current.render(onScanSuccess, onScanFailure);
            } catch (err) {
                console.error("Scanner init error:", err);
                setError("Impossibile avviare la fotocamera.");
            }
        }, 100);

        function onScanSuccess(decodedText: string) {
            onScan(decodedText);
            // Optionally stop scanning here if we want scanning to close immediately
            // But usually we let the parent handle closing
        }

        function onScanFailure(error: any) {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
                <X size={24} />
            </button>

            <h2 className="text-white text-xl font-bold mb-4">Scansiona Codice a Barre</h2>

            <div id="reader" className="w-full max-w-sm bg-white rounded-lg overflow-hidden"></div>

            {error && (
                <p className="text-red-400 mt-4 text-center">{error}</p>
            )}

            <p className="text-gray-400 text-sm mt-4 text-center max-w-xs">
                Inquadra il codice a barre del prodotto per cercare i valori nutrizionali.
            </p>
        </div>
    );
}
