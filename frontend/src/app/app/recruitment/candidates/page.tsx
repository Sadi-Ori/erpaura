'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import RecruitmentSubNav from '../RecruitmentSubNav';
import { ApplicantProfile } from '@/lib/types';
import { getApplicantProfiles } from '@/lib/recruitment-api';

export default function CandidateDirectoryPage() {
  const [candidates, setCandidates] = useState<ApplicantProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<ApplicantProfile | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const data = await getApplicantProfiles();
    setCandidates(data);
    setLoading(false);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.headline?.toLowerCase().includes(q) ||
      c.skills?.some((s) => s.skill_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Candidate Talent Pool Directory
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {candidates.length} Profiles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search universal reusable applicant profiles, verified skill competencies, and CV records across subsidiaries.
          </p>
        </div>
      </div>

      <RecruitmentSubNav />

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 ml-1" />
        <input
          type="text"
          placeholder="Search by candidate name, skill (Python, React, AWS), email, or headline..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
          Loading candidate talent pool...
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No candidates match your search</h3>
          <p className="text-xs text-slate-400">Try a different name or skill query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => setActiveProfile(cand)}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer shadow-xs hover:shadow-xl hover:shadow-purple-500/5 transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {cand.first_name} {cand.last_name}
                  </h3>
                  <p className="text-xs text-purple-300 font-medium line-clamp-1">{cand.headline || 'Enterprise Professional'}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{cand.email}</span>
                  </div>
                  {cand.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{cand.phone}</span>
                    </div>
                  )}
                  {cand.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{cand.address}</span>
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                {cand.skills && cand.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {cand.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {s.skill_name}
                      </span>
                    ))}
                    {cand.skills.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{cand.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {cand.resume_url ? (
                  <a
                    href={cand.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileText className="w-3 h-3" />
                    <span>View Resume</span>
                  </a>
                ) : <span className="text-slate-500">No CV Attached</span>}

                <span className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center gap-1 text-[11px]">
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Profile Detail Modal */}
      {/* ========================================================================= */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Reusable Candidate Profile</span>
                <h3 className="text-xl font-bold text-white">{activeProfile.first_name} {activeProfile.last_name}</h3>
                <p className="text-xs text-purple-300">{activeProfile.headline}</p>
              </div>
              <button
                onClick={() => setActiveProfile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio summary */}
            {activeProfile.bio_summary && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-white block">Professional Summary</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{activeProfile.bio_summary}</p>
              </div>
            )}

            {/* Education History */}
            {activeProfile.educations && activeProfile.educations.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>Education</span>
                </span>
                <div className="space-y-2">
                  {activeProfile.educations.map((edu, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{edu.degree} in {edu.field_of_study}</span>
                        <span className="text-slate-400 text-[11px]">{edu.institution}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">{edu.start_year} - {edu.end_year || 'Ongoing'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {activeProfile.experiences && activeProfile.experiences.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Work Experience</span>
                </span>
                <div className="space-y-2">
                  {activeProfile.experiences.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{exp.position}</span>
                        <span className="text-slate-500 text-[11px]">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</span>
                      </div>
                      <span className="text-purple-300 text-[11px] block">{exp.company} &bull; {exp.location}</span>
                      {exp.description && (
                        <p className="text-slate-400 text-[11px] leading-relaxed pt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {activeProfile.skills && activeProfile.skills.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Skills Competencies</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProfile.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                      <strong>{s.skill_name}</strong> &bull; <span className="uppercase text-[10px] text-purple-400">{s.proficiency}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume button */}
            {activeProfile.resume_url && (
              <div className="pt-2 flex justify-end">
                <a
                  href={activeProfile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download / View Resume</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
