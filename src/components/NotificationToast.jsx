import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((n) => {
        const isAccept = n.type === 'accept' || n.type === 'success';
        const isReject = n.type === 'reject' || n.type === 'warning';

        return (
          <div 
            key={n.id} 
            className="toast"
            style={{
              borderLeft: isAccept 
                ? '5px solid #58CC02' 
                : isReject 
                ? '5px solid #FF9600' 
                : '5px solid #0969da'
            }}
          >
            {isAccept && <CheckCircle2 size={18} color="#58CC02" />}
            {isReject && <AlertCircle size={18} color="#FF9600" />}
            {!isAccept && !isReject && <Info size={18} color="#58CC02" />}
            
            <span style={{ flex: 1, fontSize: '0.88rem' }}>{n.message}</span>

            <button 
              onClick={() => onDismiss(n.id)}
              style={{ background: 'transparent', color: '#999', padding: '2px', display: 'flex' }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
