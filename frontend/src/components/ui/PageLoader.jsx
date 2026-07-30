import logo from "../../assets/logo.png";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-12 w-12 rounded-2xl flex items-center justify-center">
          <img src={logo} alt="Pollify" className="h-8 w-8 object-contain" />
        </span>
        <p className="text-sm text-gray-400">Loading Pollify...</p>
      </div>
    </div>
  );
}
