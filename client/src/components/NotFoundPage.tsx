
import React from 'react';

const GhostIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-2 5c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z" opacity="0.3"/>
    <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-2-7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-2 5c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z"/>
    <path d="M11.5 13.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
    <path d="M12,7c-2.76,0-5,2.24-5,5h10C17,9.24,14.76,7,12,7z M10,11H8v-1h2V11z M16,11h-2v-1h2V11z" />
  </svg>
);


const NotFoundPage: React.FC = () => {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-indigo-900">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-20 blur-3xl"></div>
      
      <div className="relative text-center p-8 z-10">
        <div className="relative inline-block">
          <h1 className="text-9xl md:text-[180px] font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <GhostIcon className="w-24 h-24 text-white opacity-10 animate-bounce" />
          </div>
        </div>

        <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Ối! Lạc đường rồi.
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-lg text-indigo-200">
          Có vẻ như bạn đã đi vào một chiều không gian không xác định. Đừng lo, chúng tôi sẽ giúp bạn quay trở lại.
        </p>

        <div className="mt-10">
          <a
            href="/"
            className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Quay Về Trang Chủ
          </a>
        </div>
      </div>
      
      {/* Các hạt sao lấp lánh */}
      {[...Array(50)].map((_, i) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          backgroundColor: 'white',
          borderRadius: '50%',
          animation: `twinkle ${Math.random() * 5 + 3}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: Math.random() * 0.7
        };
        return <div key={i} style={style}></div>;
      })}
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .animate-bounce {
            animation: bounce 3s infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translate(-50%, -50%) translateY(-15%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
                transform: translate(-50%, -50%) translateY(0);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
        }
      `}</style>
    </main>
  );
};

export default NotFoundPage;
