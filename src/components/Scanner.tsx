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
        const timer = setTimeout(() => {
            if (!document.getElementById('reader')) return;

            try {
                // Config to try to force back camera "environment"
                // Html5QrcodeScanner abstracts this, but we pass config
                // We'd ideally use Html5Qrcode directly for more control but Scanner is simple.
                // The library remembers the last camera used typically.
                scannerRef.current = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true
                    },
                    false
                );

                scannerRef.current.render(onScanSuccess, onScanFailure);
            } catch (err) {
                console.error("Scanner init error:", err);
                setError("Impossibile avviare la fotocamera.");
            }
        }, 100);

        function onScanSuccess(decodedText: string) {
            onScan(decodedText);
        }

        function onScanFailure(error: any) {
            // ignore
        }

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch (e) { console.warn(e); }
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-3 rounded-full bg-white/20 hover:bg-white/30"
            >
                <X size={24} />
            </button>

            <h2 className="text-white text-xl font-bold mb-8">Scansiona Barcode</h2>

            <div id="reader" className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"></div>

            {error && (
                <p className="text-red-400 mt-4 text-center font-medium bg-red-900/20 p-2 rounded">{error}</p>
            )}

            <button
                onClick={onClose}
                className="mt-8 px-6 py-4 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform hover:bg-gray-100 w-full max-w-sm"
            >
                Prodotto non trovato? Inserisci a mano
            </button>
        </div>
    );
}
