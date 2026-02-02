import './Input.css';

function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    icon,
    className = '',
    ...props
}) {
    return (
        <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
            {label && (
                <label className="input-group__label">
                    {label}
                    {required && <span className="input-group__required">*</span>}
                </label>
            )}
            <div className="input-group__wrapper">
                {icon && <span className="input-group__icon">{icon}</span>}
                <input
                    type={type}
                    className={`input-group__input ${icon ? 'input-group__input--with-icon' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    {...props}
                />
            </div>
            {error && <span className="input-group__error">{error}</span>}
        </div>
    );
}

export default Input;
