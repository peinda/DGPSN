import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import KpiCard from '@/Components/Dashboard/KpiCard.jsx';
import LineChart from '@/Components/Dashboard/LineChart.jsx';
import DonutChart from '@/Components/Dashboard/DonutChart.jsx';
import StatusBadge from '@/Components/UI/StatusBadge.jsx';
import ActivityItem from '@/Components/Dashboard/ActivityItem.jsx';

const defaultStats = {
    total: 1250, total_trend: 12.5,
    en_attente: 250, en_attente_trend: 8.2,
    approuvees: 850, approuvees_trend: 15.3,
    rejetees: 150, rejetees_trend: 3.6,
    cloturees: 50, cloturees_trend: 5.4,
};

const defaultEvolutionData = {
    labels: ['Déc.', 'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai'],
    values: [180, 210, 240, 300, 280, 350],
};

const defaultRepartitionData = [
    { label: 'Assistance médicale', value: 438, color: '#16a34a' },
    { label: 'Tabaski', value: 313, color: '#eab308' },
    { label: 'Korité', value: 250, color: '#3b82f6' },
    { label: 'Urgence sociale', value: 188, color: '#ef4444' },
    { label: 'Autres', value: 61, color: '#d1d5db' },
];

const defaultGenreData = [
    { label: 'Hommes', value: 0, color: '#3b82f6' },
    { label: 'Femmes', value: 0, color: '#F5A623' },
];

const defaultDernieresDemandes = [
    { id: 1, reference: 'DPS-2025-1250', citoyen: 'Awa Fall', type: 'Assistance médicale', statut: 'en_attente', date: '21/05/2025' },
    { id: 2, reference: 'DPS-2025-1249', citoyen: 'Mamadou Diop', type: 'Tabaski', statut: 'approuvee', date: '21/05/2025' },
    { id: 3, reference: 'DPS-2025-1248', citoyen: 'Fatou Ndiaye', type: 'Urgence sociale', statut: 'rejetee', date: '20/05/2025' },
    { id: 4, reference: 'DPS-2025-1247', citoyen: 'Ibrahima Ba', type: 'Korité', statut: 'approuvee', date: '20/05/2025' },
    { id: 5, reference: 'DPS-2025-1246', citoyen: 'Binta Sy', type: 'Assistance médicale', statut: 'en_attente', date: '19/05/2025' },
];

const defaultActiviteRecente = [
    { id: 1, icon: 'user', titre: 'Nouvelle demande enregistrée', description: 'DPS-2025-1250 par Awa Fall', temps: 'Il y a 5 min' },
    { id: 2, icon: 'check', titre: 'Demande approuvée', description: 'DPS-2025-1249 par le comité', temps: 'Il y a 1 heure' },
    { id: 3, icon: 'file', titre: 'Rapport mensuel généré', description: 'Rapport de mai 2025', temps: 'Il y a 3 heures' },
    { id: 4, icon: 'user-add', titre: 'Nouvel utilisateur ajouté', description: 'Moussa Camara - Agent', temps: 'Il y a 5 heures' },
];

export default function DashboardIndex({
    stats = defaultStats,
    evolutionData = defaultEvolutionData,
    repartitionData = defaultRepartitionData,
    genreData = defaultGenreData,
    dernieresDemandes = defaultDernieresDemandes,
    activiteRecente = defaultActiviteRecente,
}) {
    const { props } = usePage();
    const userName = props.auth?.user?.name ?? 'Utilisateur';
    const isAgent = props.auth?.user?.role === 'agent';

    return (
        <AppLayout title="Tableau de bord">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bonjour, {userName} 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Voici un aperçu de l'activité de la plateforme DGPSN.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-5">
                <KpiCard label={isAgent ? 'Mes demandes' : 'Total demandes'} value={stats.total} trend={stats.total_trend} color="green" icon="file" />
                <KpiCard label="En attente" value={stats.en_attente} trend={stats.en_attente_trend} color="yellow" icon="clock" />
                {!isAgent && <KpiCard label="Approuvées" value={stats.approuvees} trend={stats.approuvees_trend} color="teal" icon="check" />}
                <KpiCard label="Hommes" value={genreData[0]?.value ?? 0} trend={0} color="blue" icon="users" />
                <KpiCard label="Femmes" value={genreData[1]?.value ?? 0} trend={0} color="orange" icon="users" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                {/* Line chart */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-800">Évolution des demandes</h2>
                        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                            <option>6 derniers mois</option>
                            <option>3 derniers mois</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    <LineChart data={evolutionData} />
                </div>

                {/* Donut chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Répartition par type d'aide</h2>
                    <DonutChart data={repartitionData} />
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Recent requests table */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Dernières demandes</h2>
                        <Link href="/demandes" className="text-xs text-green-700 font-medium hover:underline">Voir tout</Link>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Référence</th>
                                <th className="text-left px-3 py-3 font-medium">Citoyen</th>
                                <th className="text-left px-3 py-3 font-medium">Type d'aide</th>
                                <th className="text-left px-3 py-3 font-medium">Statut</th>
                                <th className="text-left px-3 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dernieresDemandes.map((d) => (
                                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{d.reference}</td>
                                    <td className="px-3 py-3 text-gray-800 font-medium">{d.citoyen}</td>
                                    <td className="px-3 py-3 text-gray-600">{d.type}</td>
                                    <td className="px-3 py-3">
                                        <StatusBadge status={d.statut} />
                                    </td>
                                    <td className="px-3 py-3 text-gray-500 text-xs">{d.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Activity feed */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Activité récente</h2>
                    <div className="space-y-4">
                        {activiteRecente.map((item) => (
                            <ActivityItem
                                key={item.id}
                                icon={item.icon}
                                title={item.titre}
                                description={item.description}
                                time={item.temps}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
