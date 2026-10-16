import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['Entertainment', 'Productivity', 'Utilities', 'Health'];

function Subscriptions() {
    const navigate = useNavigate();

    const [subscriptions, setSubscriptions] = useState([]);
    const [serviceName, setServiceName] = useState('');
    const [cost, setCost] = useState('');
    const [billingCycle, setBillingCycle] = useState('Monthly');
    const [nextBillingDate, setNextBillingDate] = useState('');
    const [isTrial, setIsTrial] = useState(false);
    const [category, setCategory] = useState('Entertainment');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Get this user's subscriptions, soonest billing date first
    async function loadSubscriptions() {
        const { data, error: loadError } = await supabase
            .from('subscriptions')
            .select('*')
            .order('next_billing_date', { ascending: true });

        if (loadError) {
            setError('Could not load your subscriptions. Please try again.');
            return;
        }
        setSubscriptions(data);
    }

    useEffect(() => {
        async function init() {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                navigate('/login');
                return;
            }
            loadSubscriptions();
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!serviceName.trim()) {
            setError('Service name is required.');
            return;
        }
        if (cost === '' || Number(cost) < 0) {
            setError('Cost must be a number of 0 or more.');
            return;
        }
        if (!nextBillingDate) {
            setError('Next billing date is required.');
            return;
        }

        const { error: insertError } = await supabase.from('subscriptions').insert({
            service_name: serviceName.trim(),
            cost: Number(cost),
            billing_cycle: billingCycle,
            next_billing_date: nextBillingDate,
            is_trial: isTrial,
            category: category,
        });

        if (insertError) {
            // Generic message on purpose (no database details shown to the user)
            setError('Could not save the subscription. Please try again.');
            return;
        }

        setSuccess('Subscription added.');
        setServiceName('');
        setCost('');
        setBillingCycle('Monthly');
        setNextBillingDate('');
        setIsTrial(false);
        setCategory('Entertainment');
        loadSubscriptions();
    }

    return (
        <div className="subs-page">
            <h1 className="brand">Subscription Sniper</h1>
            <h2>My Subscriptions</h2>

            <form className="subs-form" onSubmit={handleSubmit}>
                <label htmlFor="serviceName">Service name</label>
                <input
                    id="serviceName"
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Netflix"
                />

                <label htmlFor="cost">Cost ($)</label>
                <input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="15.99"
                />

                <label htmlFor="billingCycle">Billing cycle</label>
                <select
                    id="billingCycle"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                </select>

                <label htmlFor="nextBillingDate">Next billing date</label>
                <input
                    id="nextBillingDate"
                    type="date"
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                />

                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                <label className="subs-check" htmlFor="isTrial">
                    <input
                        id="isTrial"
                        type="checkbox"
                        checked={isTrial}
                        onChange={(e) => setIsTrial(e.target.checked)}
                    />
                    Is this a trial?
                </label>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <button type="submit">Add subscription</button>
            </form>

            <h3>Your list</h3>
            {subscriptions.length === 0 ? (
                <p>No subscriptions yet. Add your first one above.</p>
            ) : (
                <div className="table-wrap">
                    <table className="subs-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Cost</th>
                                <th>Cycle</th>
                                <th>Next billing</th>
                                <th>Category</th>
                                <th>Trial</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.service_name}</td>
                                    <td>${Number(s.cost).toFixed(2)}</td>
                                    <td>{s.billing_cycle}</td>
                                    <td>{s.next_billing_date}</td>
                                    <td>{s.category}</td>
                                    <td>{s.is_trial ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
}

export default Subscriptions;