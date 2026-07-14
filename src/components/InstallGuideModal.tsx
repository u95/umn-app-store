import { Smartphone, Chrome, Monitor, X, Share, Download, CheckCircle2, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallGuideModal({ isOpen, onClose }: InstallGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none" id="install-guide-modal-overlay">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10"
          >
            {/* Elegant Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Download className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                    செயலியை நிறுவுவது எப்படி?
                  </h3>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                    UMN App Store (PWA App)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
              {/* Value Proposition */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-2">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ஏன் நிறுவ வேண்டும்?
                </h4>
                <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pl-1">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>மொபைலில் மிகக் குறைந்த நினைவகமே (Storage) தேவைப்படும்.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>வழக்கமான APK செயலி போல மிக வேகமாக இயங்கும்.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>முகப்புத் திரையில் (Home Screen) அழகான லான்ச்சர் ஐகான் கிடைக்கும்.</span>
                  </li>
                </ul>
              </div>

              {/* Instructions Tab Options */}
              <div className="space-y-3.5">
                {/* Android Chrome */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 pl-0.5">
                    <Chrome className="w-4 h-4 text-blue-500" />
                    <span>1. ஆண்ட்ராய்டு (Android Chrome) வழிமுறை:</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6 space-y-2 leading-relaxed">
                    <p>
                      உங்கள் மொபைல் கூகுள் குரோம் (Chrome) பிரவுசரின் வலது மேல் மூலையிலுள்ள 
                      <strong className="text-zinc-900 dark:text-zinc-100"> மூன்று புள்ளிகளை (...) </strong> அழுத்தவும்.
                    </p>
                    <p>
                      மெனுவில் உள்ள <strong className="text-green-500">"Add to Home screen" (முகப்புத் திரையில் சேர்) </strong> அல்லது 
                      <strong className="text-green-500"> "Install App" </strong> என்பதைத் தேர்ந்தெடுக்கவும்.
                    </p>
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-900" />

                {/* iOS Safari */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 pl-0.5">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    <span>2. ஐபோன் (iPhone Safari) வழிமுறை:</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6 space-y-2 leading-relaxed">
                    <p>
                      உங்கள் ஐபோன் சபாரி (Safari) பிரவுசரின் கீழே உள்ள 
                      <strong className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1 inline-flex bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">
                        <Share className="w-3 h-3 text-blue-500" /> பகிர்தல் (Share)
                      </strong> பொத்தானை அழுத்தவும்.
                    </p>
                    <p>
                      கீழே நகர்த்தி <strong className="text-green-500">"Add to Home Screen" (முகப்புத் திரையில் சேர்) </strong> என்பதைத் தேர்ந்தெடுக்கவும்.
                    </p>
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-900" />

                {/* PC / Desktop */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 pl-0.5">
                    <Monitor className="w-4 h-4 text-zinc-500" />
                    <span>3. கணினி / மடிக்கணினி (PC) வழிமுறை:</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6 space-y-1.5 leading-relaxed">
                    <p>
                      பிரவுசர் முகவரி பட்டியின் (Address bar) வலதுபுறத்தில் உள்ள 
                      <strong className="text-zinc-900 dark:text-zinc-100"> "Install" (பதிவிறக்க ஐகான்) </strong>-ஐ அழுத்தவும்.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/10 cursor-pointer"
              >
                புரிந்தது, நன்றி!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
