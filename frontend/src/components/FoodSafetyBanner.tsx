import React, { useState } from 'react';
import { ShieldAlert, Info, X, CheckCircle2, Thermometer, FileText } from 'lucide-react';

export const FoodSafetyBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-900 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Food Safety Notice:</strong> FoodBridge facilitates safe surplus food redistribution. The platform does not inspect, test, or certify food safety. Donors certify adherence to food safety standards.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-amber-800 font-semibold underline hover:text-amber-950 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            Safety Guidelines
          </button>
        </div>
      </div>

      {/* Safety Guidelines Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Food Safety & Compliance Policy</h3>
                  <p className="text-xs text-slate-500">Standards governing safe food redistribution (HACK-P197)</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/60">
                <h4 className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Platform Limitation & Good Samaritan Protections
                </h4>
                <p className="text-xs text-amber-800">
                  FoodBridge operates strictly as a coordination technology platform. <strong>Never does FoodBridge inspect, endorse, or certify the safety of any food listed.</strong> Surplus food donations are legally protected under Good Samaritan food donation laws (such as the Bill Emerson Good Samaritan Food Donation Act) when donated in good faith to recognized non-profit organizations.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Donor Responsibilities & Requirements
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>Donors must be licensed commercial food operators or registered community kitchens.</li>
                  <li>Food must be prepared, cooled, and packaged strictly in compliance with applicable food-safety regulations and local health codes.</li>
                  <li>Accurate preparation timestamps, storage conditions, and realistic use-by deadlines must be disclosed on every listing.</li>
                  <li>All known major food allergens (peanuts, nuts, dairy, wheat, eggs, soy, fish, shellfish, sesame) must be declared explicitly.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-600" />
                  Cold-Chain & Temperature Safety Thresholds
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-blue-50/60 border border-blue-200/50 rounded-xl">
                    <p className="font-semibold text-blue-900">Refrigerated / Chilled</p>
                    <p className="text-blue-700 font-mono text-sm mt-0.5">Below 41°F (5°C)</p>
                    <p className="text-slate-500 mt-1">Dairy, fresh produce, prepared deli items.</p>
                  </div>
                  <div className="p-3 bg-red-50/60 border border-red-200/50 rounded-xl">
                    <p className="font-semibold text-red-900">Hot-Holding</p>
                    <p className="text-red-700 font-mono text-sm mt-0.5">Above 140°F (60°C)</p>
                    <p className="text-slate-500 mt-1">Cooked banquet meals, stews, warm meats.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recipient On-Site Verification Protocol
                </h4>
                <p className="text-xs text-slate-600">
                  Recipient organizations must inspect all donations at pickup. Check temperature, ensure packaging seals are intact, verify appearance/smell, and confirm transport vehicles (insulated containers or refrigerated vans) are appropriate before completing the digital sign-off.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
