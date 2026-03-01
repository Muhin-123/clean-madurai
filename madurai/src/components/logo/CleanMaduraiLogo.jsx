import logoSvg from '../../assets/logom.svg';

export default function CleanMaduraiLogo({ size = 44, showText = true, className = '', useImage = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSvg}
        alt="Clean Madurai Logo"
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <div>
          <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-civic-green to-civic-green bg-clip-text text-transparent leading-tight">
            CLEAN MADURAI
          </h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight tracking-wide">
            Smart City Command
          </p>
        </div>
      )}
    </div>
  );
}
