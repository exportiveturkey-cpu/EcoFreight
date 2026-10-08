
import React from 'react';
import { Database, Server, Cpu, Globe, Lock, Layers, Code, Rocket, Zap } from 'lucide-react';

const ArchitectureDocs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="border-b border-slate-200 pb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Platform Blueprint</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">EcoFreight technical specifications for enterprise-grade sustainable logistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Tech Stack</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <DocItem title="Frontend" content="React, TypeScript, Tailwind CSS, Lucide Icons" />
            <DocItem title="Visualization" content="Recharts for Decarbonization & Emissions Analytics" />
            <DocItem title="AI Intelligence" content="Google Gemini 3.8 Flash (Multimodal Routing & ESG Intelligence)" />
            <DocItem title="Backend Interface" content="Express Full-Stack API Gateway (/api/gemini/*)" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Rocket className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Deployment & DevOps</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Zap size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Cloud Run Microservices</p>
                <p className="text-xs text-slate-500 mt-1">Full-stack Express gateway with TLS 1.3 containerized on Google Cloud.</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <code className="text-[11px] text-slate-600 font-mono block"># Production Gateway:</code>
              <code className="text-[11px] text-emerald-600 font-mono block">https://ais-dev-...europe-west3.run.app</code>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-slate-900 rounded-3xl p-8 text-slate-300 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Code className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold text-white">API Reference (v1)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipment Management</p>
            <ApiEndpoint method="POST" path="/api/shipments" desc="Create new shipment" />
            <ApiEndpoint method="GET" path="/api/shipments/:id" desc="Fetch shipment details" />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sustainability</p>
            <ApiEndpoint method="POST" path="/api/carbon/calculate" desc="Run GHG estimation" />
            <ApiEndpoint method="GET" path="/api/analytics/emissions" desc="Aggregate monthly report" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Database className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Database Schema (ERD)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SchemaCard title="Shipments" fields={['id', 'customer_id', 'origin', 'destination', 'weight', 'incoterms']} />
          <SchemaCard title="Costs" fields={['id', 'shipment_id', 'freight_base', 'fuel_surcharge', 'insurance']} />
          <SchemaCard title="Tracking" fields={['id', 'shipment_id', 'status', 'location_gps', 'timestamp']} />
        </div>
      </section>
    </div>
  );
};

const DocItem = ({ title, content }: any) => (
  <div className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
    <p className="text-sm font-semibold text-slate-700">{content}</p>
  </div>
);

const ApiEndpoint = ({ method, path, desc }: any) => (
  <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:border-emerald-500 transition-colors">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
        }`}>{method}</span>
        <code className="text-xs text-slate-200">{path}</code>
      </div>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
  </div>
);

const SchemaCard = ({ title, fields }: any) => (
  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
    <p className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">{title}</p>
    <div className="space-y-1">
      {fields.map((f: string) => (
        <div key={f} className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div> {f}
        </div>
      ))}
    </div>
  </div>
);

export default ArchitectureDocs;
