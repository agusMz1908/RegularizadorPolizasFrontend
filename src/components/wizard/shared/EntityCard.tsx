// src/components/wizard/shared/EntityCard.tsx

import React from 'react';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Star,
  Crown,
  Zap,
  Users,
  Calendar
} from 'lucide-react';

// ✅ Tipos base
interface BaseEntityCardProps {
  isSelected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  showBadges?: boolean;
  disabled?: boolean;
  className?: string;
}

// ✅ Props para ClienteCard
interface ClienteCardProps extends BaseEntityCardProps {
  cliente: {
    id: number;
    clinom: string;
    cliced?: string;
    cliruc?: string;
    telefono?: string;
    cliemail?: string;
    clidir?: string;
    activo: boolean;
  };
  showContactInfo?: boolean;
  showStatus?: boolean;
}

// ✅ Props para CompanyCard
interface CompanyCardProps extends BaseEntityCardProps {
  company: {
    id: number;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    activo: boolean;
    logo?: string;
    website?: string;
    telefono?: string;
    email?: string;
  };
  showDetails?: boolean;
}

// ✅ Props genéricas para EntityCard
interface EntityCardProps extends BaseEntityCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badges?: Array<{
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'premium';
  }>;
  metadata?: Array<{
    icon: React.ReactNode;
    text: string;
    color?: string;
  }>;
  actions?: React.ReactNode;
}

// ✅ Hook para estilos compartidos
const useCardStyles = (
  isSelected: boolean,
  disabled: boolean,
  isDarkMode: boolean,
  size: 'sm' | 'md' | 'lg'
) => {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const baseClasses = `
    group relative border rounded-xl cursor-pointer transition-all duration-200
    ${sizeClasses[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
  `;

  const colorClasses = isSelected
    ? isDarkMode 
      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-900/20' 
      : 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
    : isDarkMode 
      ? 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-650' 
      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50';

  return {
    cardClasses: `${baseClasses} ${colorClasses}`,
    avatarSizes,
    sizeClasses
  };
};

// ✅ Componente Badge
const Badge: React.FC<{
  text: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'premium';
  isDarkMode: boolean;
  size: 'sm' | 'md' | 'lg';
}> = ({ text, variant, isDarkMode, size }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    success: isDarkMode 
      ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/50' 
      : 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: isDarkMode 
      ? 'bg-orange-900/30 text-orange-300 border border-orange-700/50' 
      : 'bg-orange-100 text-orange-700 border border-orange-200',
    error: isDarkMode 
      ? 'bg-red-900/30 text-red-300 border border-red-700/50' 
      : 'bg-red-100 text-red-700 border border-red-200',
    info: isDarkMode 
      ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
      : 'bg-blue-100 text-blue-700 border border-blue-200',
    premium: isDarkMode 
      ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 text-purple-300 border border-purple-700/50' 
      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {variant === 'premium' && <Crown className="w-3 h-3 mr-1" />}
      {variant === 'success' && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {variant === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
      {text}
    </span>
  );
};

// ✅ Componente Avatar
const Avatar: React.FC<{
  name: string;
  type: 'user' | 'company';
  size: 'sm' | 'md' | 'lg';
  isSelected: boolean;
  isDarkMode: boolean;
  premium?: boolean;
}> = ({ name, type, size, isSelected, isDarkMode, premium = false }) => {
  const { avatarSizes } = useCardStyles(isSelected, false, isDarkMode, size);
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const bgClasses = premium
    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
    : isSelected 
      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
      : isDarkMode 
        ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
        : 'bg-gradient-to-br from-gray-400 to-gray-500';

  const IconComponent = type === 'user' ? User : Building2;

  return (
    <div className={`${avatarSizes} rounded-lg flex items-center justify-center flex-shrink-0 ${bgClasses}`}>
      <IconComponent className={`${iconSizes[size]} text-white`} />
      {premium && (
        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
      )}
    </div>
  );
};

// ✅ Componente EntityCard genérico
export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  badges = [],
  metadata = [],
  actions,
  isSelected = false,
  onSelect,
  onClick,
  isDarkMode = false,
  size = 'md',
  variant = 'default',
  showBadges = true,
  disabled = false,
  className = ''
}) => {
  const { cardClasses } = useCardStyles(isSelected, disabled, isDarkMode, size);

  const handleClick = () => {
    if (disabled) return;
    if (onSelect) onSelect();
    if (onClick) onClick();
  };

  return (
    <div onClick={handleClick} className={`${cardClasses} ${className}`}>
      <div className="flex items-start justify-between">
        {/* Contenido principal */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Icono/Avatar */}
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}

          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
              
              {/* Badges */}
              {showBadges && badges.length > 0 && (
                <div className="flex space-x-1">
                  {badges.slice(0, 2).map((badge, index) => (
                    <Badge 
                      key={index} 
                      text={badge.text} 
                      variant={badge.variant} 
                      isDarkMode={isDarkMode}
                      size={size}
                    />
                  ))}
                </div>
              )}
            </div>

            {subtitle && (
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            )}

            {description && variant !== 'compact' && (
              <p className={`text-sm mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {description}
              </p>
            )}

            {/* Metadata */}
            {metadata.length > 0 && variant === 'detailed' && (
              <div className="flex flex-wrap gap-3 mt-3">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span className={item.color || (isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                      {item.icon}
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        {actions && (
          <div className="flex-shrink-0 ml-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Componente especializado para clientes
export const ClienteCard: React.FC<ClienteCardProps> = ({
  cliente,
  showContactInfo = true,
  showStatus = true,
  ...props
}) => {
  const badges: Array<{
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'premium';
  }> = [];
  
  if (showStatus) {
    badges.push({
      text: cliente.activo ? 'Activo' : 'Inactivo',
      variant: cliente.activo ? 'success' : 'error'
    });
  }

  const metadata = [];
  
  if (showContactInfo) {
    if (cliente.cliced || cliente.cliruc) {
      metadata.push({
        icon: <Hash className="w-4 h-4" />,
        text: cliente.cliced || cliente.cliruc || 'Sin documento'
      });
    }
    
    if (cliente.telefono) {
      metadata.push({
        icon: <Phone className="w-4 h-4" />,
        text: cliente.telefono
      });
    }
    
    if (cliente.cliemail) {
      metadata.push({
        icon: <Mail className="w-4 h-4" />,
        text: cliente.cliemail
      });
    }
  }

  return (
    <EntityCard
      title={cliente.clinom}
      subtitle={cliente.clidir}
      icon={<Avatar 
        name={cliente.clinom} 
        type="user" 
        size={props.size || 'md'} 
        isSelected={props.isSelected || false}
        isDarkMode={props.isDarkMode || false}
      />}
      badges={badges}
      metadata={metadata}
      {...props}
    />
  );
};

// ✅ Componente especializado para compañías
export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  showDetails = true,
  ...props
}) => {
  const badges: Array<{
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'premium';
  }> = [];
  
  badges.push({
    text: company.activo ? 'Activa' : 'Inactiva',
    variant: company.activo ? 'success' : 'error'
  });

  if (company.codigo) {
    badges.push({
      text: `#${company.codigo}`,
      variant: 'info'
    });
  }

  const metadata = [];
  
  if (showDetails) {
    if (company.telefono) {
      metadata.push({
        icon: <Phone className="w-4 h-4" />,
        text: company.telefono
      });
    }
    
    if (company.email) {
      metadata.push({
        icon: <Mail className="w-4 h-4" />,
        text: company.email
      });
    }
    
    if (company.website) {
      metadata.push({
        icon: <MapPin className="w-4 h-4" />,
        text: company.website
      });
    }
  }

  return (
    <EntityCard
      title={company.nombre}
      subtitle={company.descripcion}
      icon={<Avatar 
        name={company.nombre} 
        type="company" 
        size={props.size || 'md'} 
        isSelected={props.isSelected || false}
        isDarkMode={props.isDarkMode || false}
        premium={company.codigo === 'PREMIUM'}
      />}
      badges={badges}
      metadata={metadata}
      {...props}
    />
  );
};

export default EntityCard;