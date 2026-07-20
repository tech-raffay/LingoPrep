export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e0e0e0] mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-[#999]">
            © {new Date().getFullYear()} LingoPrep. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-[#999]">
            <span className="hover:text-[#333] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#333] cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
