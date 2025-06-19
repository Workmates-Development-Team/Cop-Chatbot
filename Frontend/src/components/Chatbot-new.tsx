import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
// import './Chatbot.css';
import police from './assets/Police.png';

const Chatbotnew = () => {
  const categories = [
    { title: 'Personal Safety', description: 'Tips and guidance for personal security' },
    { title: 'Vehicle Crime', description: 'Report vehicle theft or related crimes' },
    { title: 'Personal Safety', description: 'Tips for securing your home' },
    { title: 'Computer and Internet', description: 'Guidance on online safety' },
    { title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
    { title: 'Computer and Internet', description: 'Guidance on online safety' },
    { title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
    { title: 'Computer and Internet', description: 'Guidance on online safety' },
    { title: 'Consumer Fraud', description: 'Report and prevent consumer fraud' },
  ];

  return (
    <div className="container">
      <div className="chatbod-area">
        <div className="row">
          <div className="col-md-3 position-relative d-flex align-items-center justify-content-center" style={{ minHeight: 90 }}>
            <div style={{ position: 'relative', display: 'inline-block', top: '-25px' }}>
              <img src={police} alt="Kolkata Police" className="police-logo" />
              <span className="dot live-dot"></span>
            </div>
          </div>
          <div className="col-md-7">
            <h2 className="d-flex justify-content-center" style={{ fontSize: '30px', color: '#fff', fontWeight: 700 }}>
              Kolkata Police
            </h2>
            <h3 className="d-flex justify-content-center" style={{ fontSize: '20px', color: '#4ade80' }}>
              Online- Ready to help
            </h3>
            <p style={{ color: '#fff', fontSize: '16px', textAlign: 'center' }}>
              Welcome! How can we assist you today? <br />
              <span style={{ color: '#ffc221', textAlign: 'center' }}>Please select a category:</span>
            </p>
            <br />
          </div>
          <div className="col-md-2 d-flex justify-content-end cross-img">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
        </div>
        <div className="chatboat-inner">
          <div className="col-md-12">
            <div id="wrapper">
              <div className="scrollbar" id="style-1">
                <div className="force-overflow">
                  {categories.map((category, index) => (
                    <div key={index} className={`blue-box${index === 0 ? '1' : ''} bg-opacity-50`}>
                      <p style={{ fontSize: '18px', color: '#fff' }}>
                        <b style={{ fontSize: '22px' }}>{category.title}</b>
                        <br />
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbotnew;