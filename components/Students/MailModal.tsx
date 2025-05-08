import React from 'react';

interface MailModalProps {
  show: boolean;
  onClose: () => void;
  recipients: string[];
  subject: string;
  setSubject: (s: string) => void;
  body: string;
  setBody: (b: string) => void;
  sending: boolean;
  sent: boolean;
  onSend: () => void;
}

const templates = [
  {
    label: 'Class Reminder',
    subject: 'Class Reminder',
    body: 'Hello! This is a reminder that you have a driving class scheduled soon. Please be on time and bring all required documents.'
  },
  {
    label: 'Class Cancellation',
    subject: 'Class Cancellation',
    body: 'Hello, we regret to inform you that your upcoming driving class has been cancelled. Please contact us to reschedule. Sorry for the inconvenience.'
  }
];

const MailModal: React.FC<MailModalProps> = ({ show, onClose, recipients, subject, setSubject, body, setBody, sending, sent, onSend }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg animate-fade-in flex flex-col items-center relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-[#ea4335] text-2xl" onClick={onClose}>&times;</button>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#fff"/>
            <path d="M8 16l16 12 16-12" stroke="#ea4335" strokeWidth="3" strokeLinejoin="round"/>
            <rect x="8" y="16" width="32" height="16" rx="3" stroke="#ea4335" strokeWidth="3"/>
          </svg>
          <span className="text-xl font-bold text-[#ea4335]">Send Email</span>
        </div>
        {/* Plantillas rápidas */}
        <div className="flex gap-2 mb-4 w-full justify-center">
          {templates.map(t => (
            <button
              key={t.label}
              className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${t.label === 'Class Reminder' ? 'bg-[#0056b3] text-white hover:bg-[#003366]' : 'bg-[#f44336] text-white hover:bg-[#b71c1c]'}`}
              onClick={() => { setSubject(t.subject); setBody(t.body); }}
              disabled={sending || sent}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full mb-2">
          <div className="text-xs text-gray-500 mb-1">To:</div>
          <div className="text-sm text-gray-700 mb-2 max-h-16 overflow-y-auto">
            {recipients.map((email, i) => (
              <span key={email} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1 border border-gray-200">{email}</span>
            ))}
          </div>
          <input
            className="w-full border rounded p-2 mb-2 text-black placeholder:text-gray-400"
            placeholder="Subject..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={sending || sent}
          />
          <textarea
            className="w-full border rounded p-2 min-h-[80px] text-black placeholder:text-gray-400"
            placeholder="Write your message..."
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={sending || sent}
          />
        </div>
        <button
          className={`mt-2 px-6 py-2 rounded-full font-bold shadow transition-all text-white ${sending || sent ? 'bg-gray-400' : 'bg-[#ea4335] hover:bg-[#b71c1c]'}`}
          onClick={onSend}
          disabled={sending || sent || !subject.trim() || !body.trim()}
        >
          {sending ? 'Sending...' : sent ? 'Sent!' : 'Send Email'}
        </button>
        {sent && <div className="mt-2 text-green-600 font-semibold">Email sent successfully!</div>}
      </div>
    </div>
  );
};

export default MailModal; 