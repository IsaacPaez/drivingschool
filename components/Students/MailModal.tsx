import React, { useEffect, useState } from 'react';

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

const MailModal: React.FC<MailModalProps> = ({ show, onClose, recipients, subject, setSubject, body, setBody, sending, sent, onSend }) => {
  const [templates, setTemplates] = useState<{_id:string, name:string, subject:string, body:string}[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoadingTemplates(true);
    fetch('/api/gmailtemplates?type=student')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .finally(() => setLoadingTemplates(false));
  }, [show]);

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
        {/* Plantillas dinámicas */}
        <div className="flex gap-2 mb-4 w-full justify-center flex-wrap">
          {loadingTemplates ? (
            <span className="text-gray-400 text-xs">Loading templates...</span>
          ) : templates.length > 0 ? (
            templates.map(t => (
              <button
                key={t._id}
                className={`px-3 py-1 rounded-full font-semibold text-xs transition-all bg-[#0056b3] text-white hover:bg-[#003366]`}
                onClick={() => { setSubject(t.subject); setBody(t.body); }}
                disabled={sending || sent}
                title={t.name}
              >
                {t.name}
              </button>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No templates</span>
          )}
        </div>
        <div className="w-full mb-2">
          <div className="text-xs text-gray-500 mb-1">To:</div>
          <div className="text-sm text-gray-700 mb-2 max-h-16 overflow-y-auto">
            {recipients.map((recipient) => (
              <div key={recipient} className="flex items-center gap-2">
                <span>{recipient}</span>
              </div>
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