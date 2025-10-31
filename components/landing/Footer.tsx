export default function Footer() {

  return (
    <footer className="bg-[#343a40] text-white py-10 text-center">
      <div className="container flex flex-col items-center">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Ministry of Interior</h3>
          <p>Serving and Protecting Our Communities</p>
        </div>
                
        <div className="copyright">
          &copy; {new Date().getFullYear()} Ministry of Interior. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}