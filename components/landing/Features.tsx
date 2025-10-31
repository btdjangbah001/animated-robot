export default function Features() {
    const features = [
      {
        icon: "📝",
        title: "Simple Application",
        description: "Our streamlined process gets you from application to admission in the shortest time possible."
      },
      {
        icon: "🔒",
        title: "Secure Payment",
        description: "All transactions are encrypted and processed through our secure payment gateway."
      },
      {
        icon: "📱",
        title: "Track Your Status",
        description: "Real-time updates on your application status through your personalized dashboard."
      }
    ];
  
    return (
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="section-title h3">Why Choose Our Programs</h3>
            <p className="section-title p">
              Our admission process is designed to be simple, transparent, and efficient to help you focus on what matters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h4 className="feature-card h4">{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }