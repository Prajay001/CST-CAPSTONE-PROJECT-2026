import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { filterAndSortSubscriptions } from '../utils/subscriptionFilters';
import { isAlertDue, trialLabel } from '../utils/alerts';
import logo from '../assets/logo-icon.svg';
import '../styles/app-pages.css';

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
    const [editingId, setEditingId] = useState(null); // null = adding, id = editing
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // row asking "are you sure?"
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Search, filter and sort controls for the list
    const [search, setSearch] = useState('');
    const [trialFilter, setTrialFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [cycleFilter, setCycleFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');

    // Get this user's subscriptions from the database
    async function loadSubscriptions() {
        const { data, error: loadError } = await supabase
            .from('subscriptions')
            .select('*');

        if (loadError) {
            console.error('Load error:', loadError);
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

    // The rows actually shown: filtered and sorted from the full list
    const visibleSubscriptions = filterAndSortSubscriptions(subscriptions, {
        search: search,
        trial: trialFilter,
        category: categoryFilter,
        cycle: cycleFilter,
        sortBy: sortBy,
    });

    function clearFilters() {
        setSearch('');
        setTrialFilter('All');
        setCategoryFilter('All');
        setCycleFilter('All');
        setSortBy('date');
    }

    // Put the form back to its empty "add" state
    function resetForm() {
        setServiceName('');
        setCost('');
        setBillingCycle('Monthly');
        setNextBillingDate('');
        setIsTrial(false);
        setCategory('Entertainment');
        setEditingId(null);
    }

    // Fill the form with the row the user wants to edit
    function handleEdit(s) {
        setError('');
        setSuccess('');
        setConfirmDeleteId(null);
        setEditingId(s.id);
        setServiceName(s.service_name);
        setCost(String(s.cost));
        setBillingCycle(s.billing_cycle);
        setNextBillingDate(s.next_billing_date);
        setIsTrial(s.is_trial);
        setCategory(s.category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Step 1 of delete: ask on the page (no browser pop-up)
    function askDelete(id) {
        setError('');
        setSuccess('');
        setConfirmDeleteId(id);
    }

    // Step 2 of delete: the user clicked "Yes, delete"
    async function handleDelete(id) {
        setConfirmDeleteId(null);
        setError('');
        setSuccess('');

        const { error: deleteError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        // Scroll up so the message under the heading is always visible
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (deleteError) {
            console.error('Delete error:', deleteError);
            setError('Could not delete the subscription. Please try again.');
            return;
        }

        if (editingId === id) resetForm();
        setSuccess('Subscription deleted.');
        loadSubscriptions();
    }

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

        const fields = {
            service_name: serviceName.trim(),
            cost: Number(cost),
            billing_cycle: billingCycle,
            next_billing_date: nextBillingDate,
            is_trial: isTrial,
            category: category,
        };

        if (editingId) {
            // UPDATE an existing row
            const { data, error: updateError } = await supabase
                .from('subscriptions')
                .update(fields)
                .eq('id', editingId)
                .select();

            // RLS returns no error and no rows if the row is not the user's
            if (updateError || !data || data.length === 0) {
                console.error('Update error:', updateError);
                setError('Could not update the subscription. Please try again.');
                return;
            }
            setSuccess('Subscription updated.');
        } else {
            // INSERT a new row
            const { error: insertError } = await supabase
                .from('subscriptions')
                .insert(fields);

            if (insertError) {
                console.error('Insert error:', insertError);
                // Generic message on purpose (no database details shown to the user)
                setError('Could not save the subscription. Please try again.');
                return;
            }
            setSuccess('Subscription added.');
        }

        resetForm();
        loadSubscriptions();
    }

    return (
        <div className="sn-page">
            <header className="sn-header">
                <div className="sn-brand">
                    <img src={logo} alt="" width="36" height="36" />
                    <h1 className="sn-title">Subscription Sniper</h1>
                </div>
                <nav className="sn-nav" aria-label="Main navigation">
                    <button
                        type="button"
                        className="sn-btn sn-btn-secondary"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </nav>
            </header>

            <h2 className="sn-heading">My Subscriptions</h2>

            {/* All messages show here, on the page (no browser pop-ups) */}
            {error && (
                <p className="sn-error" role="alert">
                    {error}
                </p>
            )}
            {success && (
                <p className="sn-success" role="status">
                    {success}
                </p>
            )}

            <section className="sn-card" aria-labelledby="form-heading">
                <h3 id="form-heading" className="sn-subheading">
                    {editingId ? 'Edit subscription' : 'Add a subscription'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="sn-form-grid">
                        <div className="sn-field">
                            <label htmlFor="serviceName">Service name</label>
                            <input
                                id="serviceName"
                                className="sn-input"
                                type="text"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                placeholder="e.g. Netflix"
                            />
                        </div>

                        <div className="sn-field">
                            <label htmlFor="cost">Cost ($)</label>
                            <input
                                id="cost"
                                className="sn-input"
                                type="number"
                                step="0.01"
                                min="0"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="15.99"
                            />
                        </div>

                        <div className="sn-field">
                            <label htmlFor="billingCycle">Billing cycle</label>
                            <select
                                id="billingCycle"
                                className="sn-input"
                                value={billingCycle}
                                onChange={(e) => setBillingCycle(e.target.value)}
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Annual">Annual</option>
                            </select>
                        </div>

                        <div className="sn-field">
                            <label htmlFor="nextBillingDate">Next billing date</label>
                            <input
                                id="nextBillingDate"
                                className="sn-input"
                                type="date"
                                value={nextBillingDate}
                                onChange={(e) => setNextBillingDate(e.target.value)}
                            />
                        </div>

                        <div className="sn-field">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                className="sn-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="sn-check" htmlFor="isTrial">
                            <input
                                id="isTrial"
                                type="checkbox"
                                checked={isTrial}
                                onChange={(e) => setIsTrial(e.target.checked)}
                            />
                            Is this a trial?
                        </label>
                    </div>

                    <div className="sn-form-actions">
                        <button type="submit" className="sn-btn">
                            {editingId ? 'Save changes' : 'Add subscription'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="sn-btn sn-btn-secondary"
                                onClick={resetForm}
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="sn-card" aria-labelledby="list-heading">
                <h3 id="list-heading" className="sn-subheading">
                    Your list
                </h3>

                <div className="sn-controls">
                    <div className="sn-field">
                        <label htmlFor="search">Search by service name</label>
                        <input
                            id="search"
                            className="sn-input"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="e.g. Spotify"
                        />
                    </div>

                    <div className="sn-field">
                        <label htmlFor="trialFilter">Trial status</label>
                        <select
                            id="trialFilter"
                            className="sn-input"
                            value={trialFilter}
                            onChange={(e) => setTrialFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Yes">Trial</option>
                            <option value="No">Not a trial</option>
                        </select>
                    </div>

                    <div className="sn-field">
                        <label htmlFor="categoryFilter">Category</label>
                        <select
                            id="categoryFilter"
                            className="sn-input"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sn-field">
                        <label htmlFor="cycleFilter">Billing cycle</label>
                        <select
                            id="cycleFilter"
                            className="sn-input"
                            value={cycleFilter}
                            onChange={(e) => setCycleFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Annual">Annual</option>
                        </select>
                    </div>

                    <div className="sn-field">
                        <label htmlFor="sortBy">Sort by</label>
                        <select
                            id="sortBy"
                            className="sn-input"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date">Next billing date (soonest first)</option>
                            <option value="cost">Cost (highest first)</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="sn-btn sn-btn-secondary"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>

                {subscriptions.length > 0 && (
                    <p className="sn-count">
                        Showing {visibleSubscriptions.length} of {subscriptions.length}
                    </p>
                )}

                {subscriptions.length === 0 ? (
                    <p className="sn-empty">
                        No subscriptions yet. Add your first one above.
                    </p>
                ) : visibleSubscriptions.length === 0 ? (
                    <p className="sn-empty">
                        No subscriptions match your search or filters.
                    </p>
                ) : (
                    <div className="sn-table-wrap">
                        <table className="sn-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Cost</th>
                                    <th>Cycle</th>
                                    <th>Next billing</th>
                                    <th>Category</th>
                                    <th>Trial</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleSubscriptions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className={
                                            isAlertDue(s.next_billing_date) ? 'sn-alert-row' : ''
                                        }
                                    >
                                        <td data-label="Service">{s.service_name}</td>
                                        <td data-label="Cost">${Number(s.cost).toFixed(2)}</td>
                                        <td data-label="Cycle">{s.billing_cycle}</td>
                                        <td data-label="Next billing">
                                            <span>
                                                {s.next_billing_date}
                                                {isAlertDue(s.next_billing_date) && (
                                                    <span className="sn-badge">Due soon</span>
                                                )}
                                            </span>
                                        </td>
                                        <td data-label="Category">{s.category}</td>
                                        <td data-label="Trial">{trialLabel(s)}</td>
                                        <td data-label="Actions">
                                            {confirmDeleteId === s.id ? (
                                                <div
                                                    className="sn-confirm"
                                                    role="group"
                                                    aria-label={`Confirm delete ${s.service_name}`}
                                                >
                                                    <span className="sn-confirm-text">
                                                        Delete {s.service_name}?
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="sn-btn sn-btn-small sn-btn-danger"
                                                        onClick={() => handleDelete(s.id)}
                                                    >
                                                        Yes, delete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="sn-btn sn-btn-small sn-btn-secondary"
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        autoFocus
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="sn-actions">
                                                    <button
                                                        type="button"
                                                        className="sn-btn sn-btn-small"
                                                        onClick={() => handleEdit(s)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="sn-btn sn-btn-small sn-btn-danger"
                                                        onClick={() => askDelete(s.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Subscriptions;