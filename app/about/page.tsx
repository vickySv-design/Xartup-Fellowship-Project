export default function AboutPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 shadow-xl">
        <h1 className="text-3xl font-bold mb-8">About VC Intel</h1>
        
        <div className="space-y-4 text-gray-300 leading-relaxed mb-12">
          <p>
            VC Intel is a thesis-first startup intelligence tool designed to streamline venture capital sourcing workflows.
          </p>
          <p>
            It combines structured search, live website enrichment, and explainable scoring to reduce noise and surface high-signal companies aligned with fund criteria.
          </p>
          <p className="text-gray-400 text-sm">
            Built as part of a venture scouting interface challenge.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-800 text-sm text-gray-500">
          <p>Built by Vigneshwaran R.</p>
          <p>BE Computer Science &amp; Engineering</p>
        </div>
      </div>
    </div>
  );
}
