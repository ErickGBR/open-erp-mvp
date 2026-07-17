'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Clock, Camera, CameraOff, QrCode, CheckCircle, XCircle, MapPin, Clock3 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Employee info from QR lookup.
 */
interface EmployeeInfo {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
  department: string | null;
}

/**
 * Today's assignment for the employee.
 */
interface AssignmentInfo {
  id: number;
  branch: { id: number; name: string };
  shift: { id: number; name: string; startTime: string; endTime: string };
}

export default function MarcarPage() {
  const [step, setStep] = useState<'scan' | 'identified' | 'success' | 'error'>('scan');
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [markingType, setMarkingType] = useState<'in' | 'out'>('in');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
      lookupEmployee(t);
    }
  }, []);

  const lookupEmployee = async (t: string) => {
    try {
      const res = await fetch(`${API}/public/attendance/lookup/${encodeURIComponent(t)}`);
      if (!res.ok) throw new Error('Invalid QR code');
      const emp: EmployeeInfo = await res.json();
      setEmployee(emp);

      // Fetch today's assignments
      const asRes = await fetch(`${API}/public/attendance/assignments/${emp.id}`);
      if (asRes.ok) {
        const as: AssignmentInfo[] = await asRes.json();
        setAssignments(as);
        if (as.length > 0) {
          setSelectedAssignment(as[0].id);
        }
      }

      setStep('identified');
      stopCamera();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error looking up QR code');
      setStep('error');
    }
  };

  const startCamera = useCallback(async () => {
    if (!scannerContainerRef.current) return;
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract token from URL if it's a URL, or use directly
          let t = decodedText;
          try {
            const url = new URL(decodedText);
            const p = url.searchParams.get('token');
            if (p) t = p;
          } catch { /* not a URL, use raw text */ }

          setToken(t);
          lookupEmployee(t);
        },
        () => { /* ignore scan failures */ },
      );

      setCameraActive(true);
    } catch (err) {
      setMessage('Camera access denied or not available');
      setScanning(false);
    }
  }, []);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch { /* ignore */ }
      }
    };
  }, []);

  const handleMarcar = async () => {
    if (!employee) return;
    if (!selectedAssignment && assignments.length > 0) {
      setMessage('Please select an assignment');
      return;
    }

    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment) {
      setMessage('Please select a valid assignment');
      return;
    }

    try {
      const res = await fetch(`${API}/public/attendance/marcar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          branchId: assignment.branch.id,
          shiftId: assignment.shift.id,
          type: markingType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error marking attendance' }));
        throw new Error(err.message || err.error || 'Error marking attendance');
      }

      setStep('success');
      setMessage(`${markingType === 'in' ? 'Clock-in' : 'Clock-out'} registered for ${employee.firstName} ${employee.lastName}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error marking attendance');
    }
  };

  const reset = () => {
    setStep('scan');
    setEmployee(null);
    setAssignments([]);
    setSelectedAssignment(null);
    setToken('');
    setMessage('');
    setMarkingType('in');
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = DAYS[new Date().getDay()];

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Attendance Kiosk</h1>
          <p className="text-sm text-slate-400 mt-1">Scan your QR code to clock in/out</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-lg border px-4 py-3 text-sm mb-4 ${
            step === 'success'
              ? 'border-green-500/30 bg-green-900/20 text-green-300'
              : step === 'error'
              ? 'border-red-500/30 bg-red-900/20 text-red-300'
              : 'border-cyan-500/30 bg-cyan-900/20 text-cyan-300'
          }`}>
            <div className="flex items-center gap-2">
              {step === 'success' ? <CheckCircle className="w-4 h-4" /> :
               step === 'error' ? <XCircle className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
              {message}
            </div>
          </div>
        )}

        {/* Step: Scan QR */}
        {step === 'scan' && (
          <div className="glass-card rounded-xl p-6 space-y-4">
            {/* QR Scanner */}
            <div
              id="qr-reader"
              ref={scannerContainerRef}
              className={`w-full aspect-square rounded-lg overflow-hidden bg-[#1a1a2e] border border-cyan-500/20 ${
                cameraActive ? '' : 'flex items-center justify-center'
              }`}
            >
              {!cameraActive && !scanning && (
                <div className="text-center p-8">
                  <QrCode className="w-16 h-16 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-400 mb-4">Point your camera at the QR code</p>
                  <button
                    onClick={startCamera}
                    className="btn-cyan text-sm inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>
                </div>
              )}
              {scanning && !cameraActive && (
                <div className="flex items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                </div>
              )}
            </div>

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="w-full rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            )}

            {/* Manual entry divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-cyan-500/10" />
              <span className="text-xs text-slate-500">or enter token manually</span>
              <div className="flex-1 border-t border-cyan-500/10" />
            </div>

            {/* Manual token input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste QR token…"
                className="flex-1 rounded-lg bg-[#1a1a2e] border border-cyan-500/15 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-cyan-500/40 focus:ring-cyan-500/50"
              />
              <button
                onClick={() => token && lookupEmployee(token)}
                disabled={!token}
                className="btn-cyan text-sm disabled:opacity-50"
              >
                Lookup
              </button>
            </div>
          </div>
        )}

        {/* Step: Identified */}
        {step === 'identified' && employee && (
          <div className="glass-card rounded-xl p-6 space-y-4">
            {/* Employee info */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-3">
                <span className="text-xl font-bold text-white">
                  {employee.firstName[0]}{employee.lastName[0]}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-sm text-slate-400">{employee.code}</p>
              {employee.department && (
                <p className="text-xs text-slate-500">{employee.department}</p>
              )}
            </div>

            {/* Assignments */}
            {assignments.length === 0 ? (
              <div className="rounded-lg bg-amber-900/20 border border-amber-500/20 p-3 text-sm text-amber-300 text-center">
                No shifts assigned for today ({todayName})
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Today ({todayName}) — Select assignment:</p>
                {assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAssignment(a.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedAssignment === a.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-cyan-500/15 bg-[#1a1a2e] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-sm text-white font-medium">{a.branch.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock3 className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-400">{a.shift.name}</span>
                          <span className="text-xs text-slate-500">
                            ({a.shift.startTime} - {a.shift.endTime})
                          </span>
                        </div>
                      </div>
                      {selectedAssignment === a.id && (
                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {assignments.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => { setMarkingType('in'); handleMarcar(); }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  Clock In
                </button>
                <button
                  onClick={() => { setMarkingType('out'); handleMarcar(); }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  Clock Out
                </button>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-sm text-slate-400 hover:text-cyan-300 transition-colors"
            >
              Scan different code
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="glass-card rounded-xl p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Success!</h2>
            <p className="text-sm text-slate-400">{message}</p>
            <button
              onClick={reset}
              className="btn-cyan text-sm"
            >
              Mark another
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Open ERP — Attendance Kiosk v1.0
        </p>
      </div>
    </div>
  );
}
