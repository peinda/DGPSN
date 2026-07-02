const config = {
    brouillon:  { label: 'Brouillon',  bg: 'bg-gray-100',   text: 'text-gray-600' },
    soumis:     { label: 'Soumis',     bg: 'bg-blue-100',   text: 'text-blue-700' },
    en_examen:  { label: 'En examen',  bg: 'bg-purple-100', text: 'text-purple-700' },
    en_attente: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    approuvee:  { label: 'Approuvée',  bg: 'bg-green-100',  text: 'text-green-700' },
    rejetee:    { label: 'Rejetée',    bg: 'bg-red-100',    text: 'text-red-700' },
    cloture:    { label: 'Clôturée',   bg: 'bg-gray-100',   text: 'text-gray-500' },
};

export default function StatusBadge({ status }) {
    const styles = config[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };

    return (
        <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', styles.bg, styles.text].join(' ')}>
            {styles.label}
        </span>
    );
}
