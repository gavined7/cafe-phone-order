export const Footer = () => {
  return (
    <footer className="bg-gradient-coffee text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="space-y-2 text-sm opacity-90">
              <p>123 Coffee Street</p>
              <p>Downtown District</p>
              <p>City, State 12345</p>
              <p className="mt-3">
                <span className="font-medium">Hours:</span><br />
                Mon-Fri: 6:00 AM - 8:00 PM<br />
                Sat-Sun: 7:00 AM - 9:00 PM
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm opacity-90">
              <p>Phone: (555) 123-CAFE</p>
              <p>Email: hello@logincafe.com</p>
              <p>
                <span className="font-medium">Follow Us:</span><br />
                @LoginCafe on social media
              </p>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Login Cafe</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Serving premium coffee and fresh pastries since 2024. 
              We're passionate about creating the perfect cafe experience 
              with artisanal drinks and warm hospitality.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-sm opacity-75">
            © 2024 Login Cafe. All rights reserved. | Made with ❤️ for coffee lovers
          </p>
        </div>
      </div>
    </footer>
  );
};