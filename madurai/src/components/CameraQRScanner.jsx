import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, X, Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import toast from 'react-hot-toast';

export default function CameraQRScanner({ onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    let animationId;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setPermissionError(false);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setPermissionError(true);
        toast.error('Camera permission denied or unavailable');
      }
    };

    const scanQRCode = async () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanning(true);
          try {
            const qrData = JSON.parse(code.data);
            const binId = qrData.bin_id || code.data;

            const snap = await getDocs(
              query(collection(db, 'bins'), where('bin_id', '==', binId))
            );

            if (!snap.empty) {
              const binData = { id: snap.docs[0].id, ...snap.docs[0].data() };
              setResult({ valid: true, bin: binData });
              onScan?.(binData);
              toast.success('✓ Valid QR Code Scanned!');
            } else {
              setResult({ valid: false });
              toast.error('Bin not found in database');
            }
          } catch (e) {
            console.error('QR parse error:', e);
            setResult({ valid: false });
            toast.error('Invalid QR Code format');
          } finally {
            setScanning(false);
          }
        }
      }

      animationId = requestAnimationFrame(scanQRCode);
    };

    startCamera();
    if (cameraActive) {
      scanQRCode();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      const videoElem = videoRef.current;
      if (videoElem?.srcObject) {
        videoElem.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, onScan]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6 mb-6 border-2 border-civic-green/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title flex items-center gap-2">
          <Camera className="w-5 h-5 text-civic-green animate-pulse" /> Live QR Scanner
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {permissionError ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-alert-red mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Camera Permission Required
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Please allow camera access to scan QR codes
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm px-4 py-2"
          >
            Reload & Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-4 rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {cameraActive && !result && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-civic-green rounded-2xl animate-pulse shadow-lg shadow-civic-green/50" />
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            {scanning
              ? '🔍 Scanning...'
              : result
                ? result.valid
                  ? '✓ QR Code Valid!'
                  : '✗ QR Code Invalid'
                : 'Point camera at QR code on the smart bin'}
          </p>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${result.valid
                ? 'bg-civic-green/10 border-civic-green/30'
                : 'bg-alert-red/10 border-alert-red/30'
                }`}
            >
              {result.valid ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-civic-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-civic-green">✓ Valid Bin Detected</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {result.bin.location}
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.bin.ward} · {result.bin.type}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-alert-red" />
                  <p className="text-sm font-semibold text-alert-red">
                    Invalid QR Code — not found in database
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <button
            onClick={() => {
              setResult(null);
            }}
            className="w-full mt-4 py-2 rounded-xl border border-civic-green/30 text-civic-green font-medium hover:bg-civic-green/10 transition-colors text-sm"
          >
            Scan Another
          </button>
        </>
      )}
    </motion.div>
  );
}
