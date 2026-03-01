import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, Plus, Loader2, CheckCircle2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { WARDS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function QRGenerator() {
  const [form, setForm] = useState({ ward: '', location: '', type: 'General' });
  const [generating, setGenerating] = useState(false);
  const [generatedBin, setGeneratedBin] = useState(null);
  const [bins, setBins] = useState([]);
  const [loadingBins, setLoadingBins] = useState(false);
  const qrRef = useRef(null);

  const BIN_TYPES = ['General', 'Dry Waste', 'Wet Waste', 'Hazardous', 'Temple Waste'];

  const generateBin = async () => {
    if (!form.ward || !form.location) return;
    setGenerating(true);
    try {
      const binId = `BIN-${Date.now().toString(36).toUpperCase()}`;
      const docRef = await addDoc(collection(db, 'bins'), {
        bin_id: binId,
        ward: form.ward,
        location: form.location,
        type: form.type,
        status: 'active',
        created_at: serverTimestamp(),
      });

      const qrPayload = JSON.stringify({
        bin_id: binId,
        doc_id: docRef.id,
        ward: form.ward,
        type: form.type,
      });

      setGeneratedBin({ binId, docId: docRef.id, qrPayload, ward: form.ward, location: form.location, type: form.type });
      toast.success(`Bin ${binId} created in Firestore!`);
    } catch {
      toast.error('Failed to generate bin');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement('a');
      link.download = `${generatedBin.binId}-QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const loadExistingBins = async () => {
    setLoadingBins(true);
    try {
      const snap = await getDocs(query(collection(db, 'bins'), where('status', '==', 'active')));
      setBins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error('Failed to load bins');
    } finally {
      setLoadingBins(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">QR Code Generator</h1>
        <p className="page-subtitle">Create Firestore-linked bin QR codes · Downloadable as PNG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-civic-green dark:text-civic-green" /> Generate New Bin QR
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ward *</label>
              <select className="input-field" value={form.ward} onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}>
                <option value="">Select Ward</option>
                {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location / Landmark *</label>
              <input
                className="input-field"
                placeholder="e.g. Near Meenakshi Temple Gate 2"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bin Type</label>
              <div className="grid grid-cols-2 gap-2">
                {BIN_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`p-2.5 rounded-xl text-sm font-medium border text-left transition-all ${form.type === t
                      ? 'border-civic-green dark:border-civic-green bg-civic-green/10 dark:bg-civic-green/10 text-civic-green dark:text-civic-green'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                      }`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <button
              onClick={generateBin}
              disabled={!form.ward || !form.location || generating}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating in Firestore...</>
              ) : (
                <><Plus className="w-4 h-4" /> Generate Bin QR</>
              )}
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="section-title mb-5">Generated QR Code</h2>
          <AnimatePresence mode="wait">
            {generatedBin ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-civic-green" />
                  <span className="text-sm font-semibold text-civic-green">Saved to Firestore</span>
                </div>
                <div ref={qrRef} className="p-4 bg-green-50 dark:bg-green-900/10 border-2 border-dashed border-green-200 dark:border-green-800/30 rounded-3xl mb-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center justify-center relative">
                    <QRCodeSVG
                      value={generatedBin.qrPayload}
                      size={220}
                      level="H"
                      includeMargin
                      imageSettings={{
                        src: "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 48,
                        width: 48,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
                <div className="glass-card p-4 mb-4 text-left space-y-2 text-sm">
                  {[
                    { label: 'Bin ID', value: generatedBin.binId },
                    { label: 'Ward', value: generatedBin.ward },
                    { label: 'Location', value: generatedBin.location },
                    { label: 'Type', value: generatedBin.type },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={downloadQR} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PNG
                  </button>
                  <button onClick={() => setGeneratedBin(null)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Clear
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <QrCode className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">Fill in the form to generate a QR code</p>
                <p className="text-xs mt-1 opacity-60">QR codes are validated against Firestore bins collection</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Existing Bins in Firestore</h2>
          <button onClick={loadExistingBins} disabled={loadingBins} className="btn-secondary text-sm flex items-center gap-2">
            {loadingBins ? <Loader2 className="w-4 h-4 animate-spin" /> : '↻ Load Bins'}
          </button>
        </div>
        {bins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Click "Load Bins" to view existing bins</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bins.map((bin) => (
              <div key={bin.id} className="p-4 bg-white/30 dark:bg-white/5 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-civic-green dark:text-civic-green">{bin.bin_id}</span>
                  <span className="badge-green text-[10px]">{bin.status}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{bin.location}</p>
                <p className="text-xs text-gray-400 mt-0.5">{bin.ward} · {bin.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
