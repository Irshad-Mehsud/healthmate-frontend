const VitalsForm = () => {
  return (
    <section className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl mt-10">
      <h3 className="text-xl font-bold mb-6 dark:text-white">Add Manual Entry</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Blood Pressure (Systolic/Diastolic)</label>
          <input type="text" placeholder="e.g. 120/80" className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-3 focus:ring-2 focus:ring-brand-primary transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Blood Sugar (mg/dL)</label>
          <input type="number" placeholder="95" className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-3 focus:ring-2 focus:ring-brand-primary transition" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-400 mb-2">Personal Notes (Kaisa mehsoos ho raha hai?)</label>
          <textarea className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-3 h-24" placeholder="Feeling a bit tired today..."></textarea>
        </div>
        <button className="md:col-span-2 bg-brand-secondary text-white py-3 rounded-xl font-bold hover:shadow-lg transition">
          Save Entry to Timeline
        </button>
      </div>
    </section>
  );
};

export default VitalsForm;