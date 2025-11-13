// // src/App.tsx
// import { useEffect, useRef, useState } from 'react';
// import { Mic, MicOff, Volume2, VolumeX, User, Settings, LogOut } from 'lucide-react';
// import { register, login, saveMessage, loadHistory, updatePreferences } from './lib/api';



// /** ----------------------------------------------------------------
//  * Speech SDK loader (unchanged)
//  * ---------------------------------------------------------------- */
// const ensureSpeechSDK = (() => {
//   let ready: Promise<void> | null = null;
//   const tryLoadScript = (src: string): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       const s = document.createElement('script');
//       s.src = src;
//       s.async = true;
//       s.onload = () => (window as any).SpeechSDK ? resolve() : reject();
//       s.onerror = reject;
//       document.head.appendChild(s);
//     });
//   };
//   return async () => {
//     if ((window as any).SpeechSDK) return;
//     if (ready) return ready;
//     ready = (async () => {
//       const sources = [
//         '/speech-sdk/microsoft.cognitiveservices.speech.sdk.bundle-min.js?v=' + Date.now(),
//         'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.37.0/distrib/browser/microsoft.cognitiveservicespeech.sdk.bundle-min.js',
//         'https://aka.ms/csspeech/jsbrowserpackageraw'
//       ];
//       for (const src of sources) {
//         try { await tryLoadScript(src); return; } catch {}
//       }
//       throw new Error('Failed to load Speech SDK');
//     })();
//     return ready;
//   };
// })();

// const avatars = [
//   { id: 'lisa', name: 'Lisa', voice: 'en-US-JennyNeural', avatarCharacter: 'lisa', avatarStyle: 'casual-sitting' }
// ];
// const conversationSpeeds = [
//   { id: 'slow', label: 'Slow', rate: '0.8' },
//   { id: 'normal', label: 'Normal', rate: '1.0' },
//   { id: 'fast', label: 'Fast', rate: '1.2' }
// ];
// interface UserProfile {
//   _id: string;
//   email: string;
//   name: string;
//   preferred_avatar: string;
//   preferred_speed: string;
// }

// function App() {
//   // --- STATE ---
//   const [view, setView] = useState<'login' | 'register' | 'app'>('login');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
//   const [form, setForm] = useState({ email: '', password: '', name: '' });
//   const [error, setError] = useState('');


//   // --- STATE ---
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
//   const [conversationSpeed, setConversationSpeed] = useState(conversationSpeeds[1]);
//   const [showSettings, setShowSettings] = useState(false);
//   const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
//   const [transcript, setTranscript] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [sessionStarted, setSessionStarted] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [avatarReady, setAvatarReady] = useState(false);

//   // --- REFS ---
//   const recognizerRef = useRef<any>(null);
//   const speechConfigRef = useRef<any>(null);
//   const avatarSynthesizerRef = useRef<any>(null);
//   const pcRef = useRef<RTCPeerConnection | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   // --- AUTH & DATA ---
//   useEffect(() => {
//     checkLocalAuth();
//     return () => {
//       try { recognizerRef.current?.close(); } catch {}
//       try { avatarSynthesizerRef.current?.close(); } catch {}
//       try { pcRef.current?.close(); } catch {}
//     };
//   }, []);

//   const checkLocalAuth = async () => {
//     const saved = localStorage.getItem('currentUser');
//     if (saved) {
//       const user = JSON.parse(saved);
//       setCurrentUser(user);
//       setIsAuthenticated(true);
//       await loadConversationHistory(user._id);
//     }
//     setIsLoading(false);
//   };

//   const handleLogin = async (name: string) => {
//     if (!name.trim()) return;
//     try {
//       const user = await login(name);
//       localStorage.setItem('currentUser', JSON.stringify(user));
//       setCurrentUser(user);
//       setIsAuthenticated(true);
//     } catch (err) {
//       alert('Login failed. Is backend running?');
//     }
//   };

//   const handleLogout = async () => {
//     localStorage.removeItem('currentUser');
//     setIsAuthenticated(false);
//     setCurrentUser(null);
//     setConversationHistory([]);
//     setSessionStarted(false);
//     setAvatarReady(false);
//     try { recognizerRef.current?.stopContinuousRecognitionAsync(); } catch {}
//     try { avatarSynthesizerRef.current?.stopSpeakingAsync(); avatarSynthesizerRef.current?.close(); } catch {}
//     try { pcRef.current?.close(); } catch {}
//   };

//   const saveConversationMessage = async (role: 'user' | 'assistant', content: string) => {
//     if (!currentUser) return;
//     try {
//       await saveMessage(currentUser._id, role, content);
//     } catch (err) {
//       console.error('Save failed:', err);
//     }
//   };

//   const loadConversationHistory = async (userId: string) => {
//     try {
//       const history = await loadHistory(userId);
//       setConversationHistory(history.map((h: any) => ({ role: h.role, content: h.content })));
//     } catch (err) {
//       console.error('Load history failed:', err);
//     }
//   };

//   const updateUserPreferences = async () => {
//     if (!currentUser) return;
//     try {
//       await updatePreferences(currentUser._id, {
//         preferred_avatar: selectedAvatar.id,
//         preferred_speed: conversationSpeed.id
//       });
//     } catch (err) {
//       console.error('Update prefs failed:', err);
//     }
//   };

//   // --- AVATAR SESSION ---
//   const startAvatarSession = async () => {
//     console.log('START AVATAR SESSION');
//     try {
//       setSessionStarted(true);
//       await ensureSpeechSDK();
//       const SpeechSDK = (window as any).SpeechSDK;

//       const speechKey = import.meta.env.VITE_SPEECH_KEY;
//       const speechRegion = import.meta.env.VITE_SPEECH_REGION;
//       if (!speechKey || !speechRegion) {
//         alert('Missing VITE_SPEECH_KEY / VITE_SPEECH_REGION');
//         setSessionStarted(false);
//         return;
//       }

//       const tokRes = await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
//         method: 'POST',
//         headers: { 'Ocp-Apim-Subscription-Key': speechKey }
//       });
//       const token = await tokRes.text();

//       const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, speechRegion);
//       speechConfig.speechSynthesisVoiceName = selectedAvatar.voice;
//       speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_SynthEnableCompressedAudioTransmission, "false");
//       speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_SynthesisAvatarVideoFormat, "webm");
//       speechConfigRef.current = speechConfig;

//       const iceRes = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`, {
//         method: 'GET',
//         headers: { 'Ocp-Apim-Subscription-Key': speechKey }
//       });
//       const ice = await iceRes.json();
//       const urls = ice.Urls || ice.urls || (ice.url ? [ice.url] : []);
//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls, username: ice.Username || '', credential: ice.Password || '' }]
//       });
//       pcRef.current = pc;

//       pc.ontrack = (e) => {
//         if (e.track.kind === 'video' && videoRef.current) {
//           videoRef.current.srcObject = e.streams[0];
//           videoRef.current.play().catch(() => {});
//           setTimeout(() => setAvatarReady(true), 500);
//         }
//         if (e.track.kind === 'audio' && audioRef.current) {
//           audioRef.current.srcObject = e.streams[0];
//           audioRef.current.play().catch(() => {});
//         }
//       };

//       pc.addTransceiver('video', { direction: 'sendrecv' });
//       pc.addTransceiver('audio', { direction: 'sendrecv' });

//       const avatarCfg = new SpeechSDK.AvatarConfig(selectedAvatar.avatarCharacter, selectedAvatar.avatarStyle);
//       const avatarSynth = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarCfg);
//       avatarSynthesizerRef.current = avatarSynth;

//       await new Promise<void>((resolve) => {
//         const timeout = setTimeout(resolve, 5000);
//         avatarSynth.startAvatarAsync(
//           pc,
//           () => { clearTimeout(timeout); setAvatarReady(true); resolve(); },
//           (err: any) => { clearTimeout(timeout); console.error(err); resolve(); }
//         );
//       });

//       await startInitialConversation();
//     } catch (err: any) {
//       console.error('Avatar failed:', err);
//       alert('Avatar failed: ' + err.message);
//       setSessionStarted(false);
//     }
//   };

//   const startInitialConversation = async () => {
//     const greeting = `Hello ${currentUser?.name || 'there'}! I'm ${selectedAvatar.name}, your nicotine cessation coach. How are you doing today?`;
//     setConversationHistory([{ role: 'assistant', content: greeting }]);
//     await saveConversationMessage('assistant', greeting);
//     speakWithAvatar(greeting);
//     startListening();
//   };

//   // --- SPEECH RECOGNITION ---
//   const startListening = () => {
//     const SpeechSDK = (window as any).SpeechSDK;
//     if (!speechConfigRef.current) return;

//     try { recognizerRef.current?.stopContinuousRecognitionAsync(); recognizerRef.current?.close(); } catch {}

//     const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
//     const recognizer = new SpeechSDK.SpeechRecognizer(speechConfigRef.current, audioConfig);
//     recognizerRef.current = recognizer;

//     recognizer.recognized = async (_s: any, e: any) => {
//       if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
//         const userInput = e.result.text;
//         setTranscript(userInput);
//         setIsListening(false);
//         recognizer.stopContinuousRecognitionAsync();
//         await processUserInput(userInput);
//       }
//     };

//     recognizer.startContinuousRecognitionAsync(
//       () => setIsListening(true),
//       (err: any) => { console.error(err); setIsListening(false); }
//     );
//   };

//   // --- CHAT + TTS ---
//   const processUserInput = async (userInput: string) => {
//     setIsProcessing(true);
//     const newHistory = [...conversationHistory, { role: 'user', content: userInput }];
//     setConversationHistory(newHistory);
//     await saveConversationMessage('user', userInput);

//     const assistantMessage = await getAIResponse(newHistory);
//     const updated = [...newHistory, { role: 'assistant', content: assistantMessage }];
//     setConversationHistory(updated);
//     await saveConversationMessage('assistant', assistantMessage);

//     speakWithAvatar(assistantMessage);
//     setIsProcessing(false);
//     startListening();
//   };

//   const getAIResponse = async (history: any[]) => {
//     const apiKey = import.meta.env.VITE_AOAI_API_KEY;
//     const apiBase = import.meta.env.VITE_AOAI_API_BASE;
//     const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
//     const apiVersion = import.meta.env.VITE_AOAI_API_VERSION;

//     const systemPrompt = `You are ${selectedAvatar.name}, a compassionate nicotine cessation counselor. 
// Keep responses under 80 words. Use the user's name (${currentUser?.name || 'there'}).`;

//     const messages = [{ role: 'system', content: systemPrompt }, ...history];

//     const resp = await fetch(`${apiBase}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
//       body: JSON.stringify({ messages, max_tokens: 120, temperature: 0.7 })
//     });

//     const data = await resp.json();
//     return data.choices[0].message.content;
//   };

//   const speakWithAvatar = (text: string) => {
//     const SpeechSDK = (window as any).SpeechSDK;
//     if (!avatarSynthesizerRef.current) return;

//     setIsSpeaking(true);
//     const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
//       <voice name="${selectedAvatar.voice}">
//         <prosody rate="${conversationSpeed.rate}">${text}</prosody>
//       </voice>
//     </speak>`;

//     avatarSynthesizerRef.current.speakSsmlAsync(
//       ssml,
//       () => setIsSpeaking(false),
//       (err: any) => { console.error(err); setIsSpeaking(false); }
//     );
//   };

//   // --- UI ---
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
//           <h2 className="text-2xl font-bold text-center mb-6">Welcome to QuitBuddy</h2>
//           <input
//             type="text"
//             placeholder="Your name"
//             className="w-full p-3 border rounded-lg mb-4"
//             onKeyPress={(e) => e.key === 'Enter' && handleLogin((e.target as HTMLInputElement).value)}
//           />
//           <button
//             onClick={() => handleLogin((document.querySelector('input') as HTMLInputElement)?.value || 'User')}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold"
//           >
//             Start Session
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
//       <header className="bg-white shadow-sm border-b border-gray-200 p-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
//               <User className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">QuitBuddy</h1>
//               <p className="text-sm text-gray-600">Hi, {currentUser?.name}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-lg">
//               <Settings className="w-6 h-6 text-gray-600" />
//             </button>
//             <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
//               <LogOut className="w-6 h-6 text-gray-600" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {showSettings && (
//         <div className="bg-white border-b border-gray-200 p-6">
//           <div className="max-w-7xl mx-auto">
//             <h3 className="text-lg font-semibold mb-3">Conversation Speed</h3>
//             <div className="flex gap-3">
//               {conversationSpeeds.map((s) => (
//                 <button key={s.id} onClick={() => { setConversationSpeed(s); updateUserPreferences(); }}
//                   className={`flex-1 p-4 rounded-lg border-2 transition-all ${
//                     conversationSpeed.id === s.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'
//                   }`}>
//                   <div className="font-medium text-gray-900">{s.label}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       <main className="flex-1 flex flex-col items-center justify-center p-6">
//         <div className="w-full max-w-4xl">
//           {!sessionStarted ? (
//             <div className="text-center">
//               <div className="bg-white rounded-2xl shadow-xl p-12 mb-6">
//                 <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
//                 <button onClick={startAvatarSession}
//                   className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
//                   Start Session
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                 <div className="relative bg-gray-900 aspect-video">
//                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full" style={{ objectFit: 'contain', backgroundColor: '#1a1a1a' }} />
//                   <audio ref={audioRef} autoPlay playsInline />
//                   {!avatarReady && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
//                       <div className="text-center">
//                         <div className="w-32 h-32 rounded-full bg-white bg-opacity-90 flex items-center justify-center mx-auto mb-4">
//                           <User className="w-16 h-16 text-blue-500" />
//                         </div>
//                         <h3 className="text-2xl font-bold text-white">{selectedAvatar.name}</h3>
//                         <p className="text-white text-opacity-90 mt-2">Loading avatar...</p>
//                       </div>
//                     </div>
//                   )}
//                   <div className="absolute top-4 left-4 bg-black/50 px-3 py-2 rounded-lg text-white font-medium">{selectedAvatar.name}</div>
//                 </div>

//                 <div className="p-6">
//                   <div className="flex items-center justify-center gap-4">
//                     <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isListening ? 'bg-red-100' : 'bg-gray-100'}`}>
//                       {isListening ? <><Mic className="w-5 h-5 text-red-500 animate-pulse" /><span className="text-sm font-medium text-red-700">Listening...</span></>
//                                    : <><MicOff className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-700">Not Listening</span></>}
//                     </div>
//                     <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>
//                       {isSpeaking ? <><Volume2 className="w-5 h-5 text-blue-500 animate-pulse" /><span className="text-sm font-medium text-blue-700">Speaking...</span></>
//                                   : <><VolumeX className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-700">Not Speaking</span></>}
//                     </div>
//                   </div>

//                   {transcript && (
//                     <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                       <p className="text-sm text-gray-600 mb-1">You said:</p>
//                       <p className="text-gray-900">{transcript}</p>
//                     </div>
//                   )}

//                   {isProcessing && (
//                     <div className="mt-4 text-center">
//                       <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
//                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                         <span className="text-sm font-medium text-blue-700 ml-2">Processing...</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-xl p-6">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">Conversation History</h3>
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {conversationHistory.map((m, i) => (
//                     <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-green-50 mr-8'}`}>
//                       <p className="text-sm font-medium mb-1 text-gray-700">{m.role === 'user' ? 'You' : selectedAvatar.name}</p>
//                       <p className="text-gray-900">{m.content}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       <footer className="bg-white border-t border-gray-200 p-4">
//         <div className="max-w-7xl mx-auto text-center">
//           <p className="text-sm text-gray-600">
//             This application follows WHO guidelines for tobacco cessation. For medical emergencies, contact your healthcare provider.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;






// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, User, Settings, LogOut, Flame } from 'lucide-react';
import { register, login, saveMessage, loadHistory, updatePreferences } from './lib/api';
import { initDSM, next, getState } from './brain/dsm';
import { retrieve } from './brain/rag';
import { isSafe, redirect } from './brain/safety';
import { JSON_SCHEMA } from './brain/schema';
import { BoxBreathing } from './components/Drill';
import Confetti from 'react-confetti';

/** ----------------------------------------------------------------
 * Speech SDK loader
 * ---------------------------------------------------------------- */
const ensureSpeechSDK = (() => {
  let ready: Promise<void> | null = null;
  const tryLoadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => (window as any).SpeechSDK ? resolve() : reject();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  };
  return async () => {
    if ((window as any).SpeechSDK) return;
    if (ready) return ready;
    ready = (async () => {
      const sources = [
        '/speech-sdk/microsoft.cognitiveservices.speech.sdk.bundle-min.js?v=' + Date.now(),
        'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.37.0/distrib/browser/microsoft.cognitiveservicespeech.sdk.bundle-min.js',
        'https://aka.ms/csspeech/jsbrowserpackageraw'
      ];
      for (const src of sources) {
        try { await tryLoadScript(src); return; } catch {}
      }
      throw new Error('Failed to load Speech SDK');
    })();
    return ready;
  };
})();

const avatars = [
  { id: 'lisa', name: 'Lisa', voice: 'en-US-JennyNeural', avatarCharacter: 'lisa', avatarStyle: 'casual-sitting' }
];
const conversationSpeeds = [
  { id: 'slow', label: 'Slow', rate: '0.8' },
  { id: 'normal', label: 'Normal', rate: '1.0' },
  { id: 'fast', label: 'Fast', rate: '1.2' }
];

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  preferred_avatar: string;
  preferred_speed: string;
}

interface AIMessage {
  reflection: string;
  question: string;
  options: { id: string; label: string }[];
  script: string;
}

function App() {
  console.log('App v6.0 - BRAIN FIXED -', new Date().toISOString());

  // --- AUTH & VIEW ---
  const [view, setView] = useState<'login' | 'register' | 'app'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  // --- BRAIN ---
  const [dsm, setDSM] = useState(getState());
  const [showDrill, setShowDrill] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- AVATAR & SPEECH ---
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [conversationSpeed, setConversationSpeed] = useState(conversationSpeeds[1]);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<AIMessage | null>(null);

  // --- REFS ---
  const recognizerRef = useRef<any>(null);
  const speechConfigRef = useRef<any>(null);
  const avatarSynthesizerRef = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- AUTH CHECK ---
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setView('app');
      initDSM(user.name);
      setDSM(getState());
      loadConversationHistory(user._id);
    }
  }, []);

  // --- AUTH HANDLERS ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.name) return setError('All fields required');
    try {
      const user = await register(form.email, form.password, form.name);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      initDSM(user.name);
      setDSM(getState());
      setIsAuthenticated(true);
      setView('app');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Email and password required');
    try {
      const user = await login085(form.email, form.password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      initDSM(user.name);
      setDSM(getState());
      setIsAuthenticated(true);
      setView('app');
      loadConversationHistory(user._id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('login');
    setConversationHistory([]);
    setSessionStarted(false);
    setAvatarReady(false);
    setShowDrill(false);
    setShowConfetti(false);
    try { recognizerRef.current?.stopContinuousRecognitionAsync(); } catch {}
    try { avatarSynthesizerRef.current?.stopSpeakingAsync(); avatarSynthesizerRef.current?.close(); } catch {}
    try { pcRef.current?.close(); } catch {}
  };

  // --- DATA ---
  const saveConversationMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentUser) return;
    try {
      await saveMessage(currentUser._id, role, content);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const loadConversationHistory = async (userId: string) => {
    try {
      const history = await loadHistory(userId);
      setConversationHistory(history.map((h: any) => ({ role: h.role, content: h.content })));
    } catch (err) {
      console.error('Load history failed:', err);
    }
  };

  const updateUserPreferences = async () => {
    if (!currentUser) return;
    try {
      await updatePreferences(currentUser._id, {
        preferred_avatar: selectedAvatar.id,
        preferred_speed: conversationSpeed.id
      });
    } catch (err) {
      console.error('Update prefs failed:', err);
    }
  };

  // --- AVATAR SESSION ---
  const startAvatarSession = async () => {
    console.log('START AVATAR SESSION');
    try {
      setSessionStarted(true);
      await ensureSpeechSDK();
      const SpeechSDK = (window as any).SpeechSDK;

      const speechKey = import.meta.env.VITE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_SPEECH_REGION;
      if (!speechKey || !speechRegion) {
        alert('Missing VITE_SPEECH_KEY / VITE_SPEECH_REGION');
        setSessionStarted(false);
        return;
      }

      const tokRes = await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': speechKey }
      });
      const token = await tokRes.text();

      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, speechRegion);
      speechConfig.speechSynthesisVoiceName = selectedAvatar.voice;
      speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_SynthEnableCompressedAudioTransmission, "false");
      speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_SynthesisAvatarVideoFormat, "webm");
      speechConfigRef.current = speechConfig;

      const iceRes = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`, {
        method: 'GET',
        headers: { 'Ocp-Apim-Subscription-Key': speechKey }
      });
      const ice = await iceRes.json();
      const urls = ice.Urls || ice.urls || (ice.url ? [ice.url] : []);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls, username: ice.Username || '', credential: ice.Password || '' }]
      });
      pcRef.current = pc;

      pc.ontrack = (e) => {
        if (e.track.kind === 'video' && videoRef.current) {
          videoRef.current.srcObject = e.streams[0];
          videoRef.current.play().catch(() => {});
          setTimeout(() => setAvatarReady(true), 500);
        }
        if (e.track.kind === 'audio' && audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
          audioRef.current.play().catch(() => {});
        }
      };

      pc.addTransceiver('video', { direction: 'sendrecv' });
      pc.addTransceiver('audio', { direction: 'sendrecv' });

      const avatarCfg = new SpeechSDK.AvatarConfig(selectedAvatar.avatarCharacter, selectedAvatar.avatarStyle);
      const avatarSynth = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarCfg);
      avatarSynthesizerRef.current = avatarSynth;

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 5000);
        avatarSynth.startAvatarAsync(
          pc,
          () => { clearTimeout(timeout); setAvatarReady(true); resolve(); },
          (err: any) => { clearTimeout(timeout); console.error(err); resolve(); }
        );
      });

      await startInitialConversation();
    } catch (err: any) {
      console.error('Avatar failed:', err);
      alert('Avatar failed: ' + err.message);
      setSessionStarted(false);
    }
  };

  const startInitialConversation = async () => {
    next('start');
    setDSM(getState());
    const greeting = `Hey ${currentUser?.name}! I'm Lisa, your quit coach. Ready to kick nicotine?`;
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    await saveConversationMessage('assistant', greeting);
    speakWithAvatar(greeting);
    startListening();
  };

  // --- SPEECH RECOGNITION ---
  const startListening = () => {
    const SpeechSDK = (window as any).SpeechSDK;
    if (!speechConfigRef.current) return;

    try { recognizerRef.current?.stopContinuousRecognitionAsync(); recognizerRef.current?.close(); } catch {}

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfigRef.current, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognized = async (_s: any, e: any) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
        const userInput = e.result.text;
        setTranscript(userInput);
        setIsListening(false);
        recognizer.stopContinuousRecognitionAsync();
        await processUserInput(userInput);
      }
    };

    recognizer.startContinuousRecognitionAsync(
      () => setIsListening(true),
      (err: any) => { console.error(err); setIsListening(false); }
    );
  };

  // --- BRAIN + AI (FIXED) ---
  const processUserInput = async (userInput: string) => {
    setIsProcessing(true);
    const newHistory = [...conversationHistory, { role: 'user', content: userInput }];
    setConversationHistory(newHistory);
    await saveConversationMessage('user', userInput);

    // DSM transitions
    if (/craving|urge|want|need/i.test(userInput)) next('craving');
    if (/quit|stopped|done|not smoking/i.test(userInput)) next('win');
    if (/smoke|vape|hit|puff/i.test(userInput)) next('lapse');
    setDSM(getState());

    const aiResponse = await getAIResponse(newHistory);
    setLastAIResponse(aiResponse);

    const assistantText = `${aiResponse.reflection} ${aiResponse.question}`;
    const updated = [...newHistory, { role: 'assistant', content: assistantText }];
    setConversationHistory(updated);
    await saveConversationMessage('assistant', assistantText);

    speakWithAvatar(assistantText);
    setIsProcessing(false);
    startListening();
  };

  const getAIResponse = async (history: any[]): Promise<AIMessage> => {
  const state = getState();
  const ragFacts = retrieve(history[history.length - 1]?.content || '');
  const userInput = history[history.length - 1]?.content || '';

  const systemPrompt = `You are Lisa, a teen nicotine quit coach.
Output ONLY valid JSON matching this schema:
${JSON_SCHEMA}

User: ${state.data.name}
State: ${state.current}
RAG: ${ragFacts.join(' | ') || 'No facts retrieved'}

CRITICAL RULES:
- NEVER output plain text
- Use RAG facts in "script"
- If craving → give drill
`;

  const apiKey = import.meta.env.VITE_AOAI_API_KEY;
  const apiBase = import.meta.env.VITE_AOAI_API_BASE;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey || !apiBase || !deployment || !apiVersion) {
    console.error('Missing AOAI env vars:', { apiKey: !!apiKey, apiBase: !!apiBase, deployment: !!deployment, apiVersion: !!apiVersion });
    return {
      reflection: "I'm here.",
      question: "How are you feeling?",
      options: [],
      script: "Try deep breathing."
    };
  }

  const url = `${apiBase}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  console.log('AOAI URL:', url); // DEBUG

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-5)
  ];

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages,
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: "json_object" },
        seed: 42
      })
    });

    // DEBUG: Log full response
    console.log('AOAI Response Status:', resp.status);
    const text = await resp.text();
    console.log('AOAI Raw Response:', text);

    if (!resp.ok) {
      console.error('AOAI HTTP Error:', resp.status, text);
      return {
        reflection: "I'm here.",
        question: "How are you feeling?",
        options: [],
        script: "Try deep breathing."
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse failed:', text);
      return {
        reflection: "I'm here.",
        question: "How are you feeling?",
        options: [],
        script: "Try deep breathing."
      };
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('No choices in response:', data);
      return {
        reflection: "I'm here.",
        question: "How are you feeling?",
        options: [],
        script: "Try deep breathing."
      };
    }

    const raw = data.choices[0].message.content.trim();
    console.log('Raw LLM output:', raw);

    let json: AIMessage;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('JSON parse failed:', raw);
      const fact = ragFacts[0] || "Cravings pass in 3-5 minutes.";
      json = {
        reflection: "I hear you.",
        question: "Want a quick drill?",
        options: [{ id: "box", label: "Box Breathing" }],
        script: fact
      };
    }

    if (!isSafe(userInput)) {
      json = {
        reflection: "Let’s stay focused.",
        question: redirect(),
        options: [],
        script: ""
      };
    }

    return json;
  } catch (err) {
    console.error('AI failed:', err);
    return {
      reflection: "I'm here.",
      question: "How are you feeling?",
      options: [],
      script: "Try deep breathing."
    };
  }
};

  const speakWithAvatar = (text: string) => {
    const SpeechSDK = (window as any).SpeechSDK;
    if (!avatarSynthesizerRef.current) return;

    setIsSpeaking(true);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${selectedAvatar.voice}">
        <prosody rate="${conversationSpeed.rate}">${text}</prosody>
      </voice>
    </speak>`;

    avatarSynthesizerRef.current.speakSsmlAsync(
      ssml,
      () => setIsSpeaking(false),
      (err: any) => { console.error(err); setIsSpeaking(false); }
    );
  };

  const handleOption = (id: string) => {
    if (id === 'box') {
      setShowDrill(true);
      setTimeout(() => {
        setShowDrill(false);
        next('win');
        setDSM(getState());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 16000);
    }
  };

  // --- AUTH UI ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Login to QuitBuddy</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg mb-4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold mb-3">Login</button>
          </form>
          <p className="text-center text-sm">
            No account? <button onClick={() => { setView('register'); setError(''); }} className="text-blue-600 underline">Register</button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Name" className="w-full p-3 border rounded-lg mb-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg mb-4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold mb-3">Register</button>
          </form>
          <p className="text-center text-sm">
            Have account? <button onClick={() => { setView('login'); setError(''); }} className="text-blue-600 underline">Login</button>
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuitBuddy</h1>
              <p className="text-sm text-gray-600">Hi, {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Conversation Speed</h3>
            <div className="flex gap-3">
              {conversationSpeeds.map((s) => (
                <button key={s.id} onClick={() => { setConversationSpeed(s); updateUserPreferences(); }}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${conversationSpeed.id === s.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                  <div className="font-medium text-gray-900">{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {!sessionStarted ? (
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-xl p-12 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
                <button onClick={startAvatarSession}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
                  Start Session
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative bg-gray-900 aspect-video">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full" style={{ objectFit: 'contain', backgroundColor: '#1a1a1a' }} />
                  <audio ref={audioRef} autoPlay playsInline />
                  {!avatarReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
                      <div className="text-center">
                        <div className="w-32 h-32 rounded-full bg-white bg-opacity-90 flex items-center justify-center mx-auto mb-4">
                          <User className="w-16 h-16 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{selectedAvatar.name}</h3>
                        <p className="text-white text-opacity-90 mt-2">Loading avatar...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/50 px-3 py-2 rounded-lg text-white font-medium">{selectedAvatar.name}</div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isListening ? 'bg-red-100' : 'bg-gray-100'}`}>
                      {isListening ? <><Mic className="w-5 h-5 text-red-500 animate-pulse" /><span className="text-sm font-medium text-red-700">Listening...</span></>
                                   : <><MicOff className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-700">Not Listening</span></>}
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {isSpeaking ? <><Volume2 className="w-5 h-5 text-blue-500 animate-pulse" /><span className="text-sm font-medium text-blue-700">Speaking...</span></>
                                  : <><VolumeX className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-700">Not Speaking</span></>}
                    </div>
                  </div>

                  {showDrill && <BoxBreathing />}

                  {lastAIResponse && lastAIResponse.options.length > 0 && (
                    <div className="mt-4 flex gap-3 justify-center">
                      {lastAIResponse.options.map(opt => (
                        <button key={opt.id} onClick={() => handleOption(opt.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:shadow-md transition-all">
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {lastAIResponse && lastAIResponse.script && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-gray-700">
                      <strong>Tip:</strong> {lastAIResponse.script}
                    </div>
                  )}

                  {transcript && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">You said:</p>
                      <p className="text-gray-900">{transcript}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-sm font-medium text-blue-700 ml-2">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Conversation History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {conversationHistory.map((m, i) => (
                    <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-green-50 mr-8'}`}>
                      <p className="text-sm font-medium mb-1 text-gray-700">{m.role === 'user' ? 'You' : selectedAvatar.name}</p>
                      <p className="text-gray-900">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
      {dsm.data.streak > 0 && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg animate-pulse flex items-center gap-2">
          <Flame className="w-6 h-6" /> {dsm.data.streak} day{dsm.data.streak > 1 ? 's' : ''}
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            This application follows WHO guidelines for tobacco cessation. For medical emergencies, contact your healthcare provider.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;