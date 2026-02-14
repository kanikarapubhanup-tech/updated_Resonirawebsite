import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = '+1234567890', message = 'Hi! I would like to know more about SyncAi Technologies.' }) => {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      className="va-whatsapp-button"
      onClick={handleWhatsAppClick}
      title="Contact us on WhatsApp"
    >
      <MessageCircle size={32} />
    </button>
  );
};

export default WhatsAppButton;

