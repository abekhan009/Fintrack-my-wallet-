import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../Card/Card';
import Button from '../Button/Button';
import Input from '../Input/Input';
import './TuitionSetup.css';

function TuitionSetup({ onComplete }) {
    const { updateUserProfile } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tuitionCenterName, setTuitionCenterName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tuitionCenterName.trim()) {
            setError('Tuition center name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updateUserProfile({ tuitionCenterName: tuitionCenterName.trim() });
            onComplete?.();
        } catch (err) {
            setError(err.message || 'Failed to save tuition center name');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tuition-setup">
            <Card className="tuition-setup__card">
                <div className="tuition-setup__header">
                    <div className="tuition-setup__icon">🎓</div>
                    <h2 className="tuition-setup__title">Setup Your Tuition Center</h2>
                    <p className="tuition-setup__description">
                        Please provide your tuition center name to start managing students and fees.
                    </p>
                </div>

                {error && (
                    <div className="tuition-setup__error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="tuition-setup__form">
                    <Input
                        label="Tuition Center Name"
                        value={tuitionCenterName}
                        onChange={(e) => setTuitionCenterName(e.target.value)}
                        placeholder="e.g., ABC Learning Center"
                        required
                        disabled={loading}
                    />

                    <div className="tuition-setup__actions">
                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={loading || !tuitionCenterName.trim()}
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </form>

                <div className="tuition-setup__note">
                    <p>
                        💡 You can change this name later in your profile settings.
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default TuitionSetup;