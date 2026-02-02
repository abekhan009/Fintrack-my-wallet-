import './Card.css';

function Card({ children, className = '', variant = 'default', onClick }) {
    return (
        <div
            className={`card card--${variant} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}

export default Card;
