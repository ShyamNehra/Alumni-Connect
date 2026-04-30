import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { seedJobs } from '../../data/seedData';
import { Toast } from '../Common/Toast';

type RoleType = 'Internship' | 'Full-time' | 'Part-time' | 'Contract' | 'Remote';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: RoleType;
  description: string;
  deadline?: string;
  requiredSkills?: string[];
  postedById?: string;
  postedByName?: string;
}

interface Application {
  jobId: string;
  jobTitle: string;
  company?: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  resumeLink?: string;
  motivation?: string;
  applicantSkills?: string[];
  appliedAt: string;
}

export default function Jobs() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(seedJobs as Job[]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [tab, setTab] = useState<'list' | 'myApplications'>('list');
  const [applications, setApplications] = useState<Application[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesQuery = [job.title, job.company, job.location]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = filter === 'All' ? true : job.type === filter;
      return matchesQuery && matchesFilter;
    });
  }, [jobs, query, filter]);

  function handlePostSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const rawSkills = (data.get('requiredSkills') as string) || '';
    const parsedSkills = rawSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title: (data.get('title') as string) || 'Untitled',
      company: (data.get('company') as string) || 'Unknown',
      companyLogo: (data.get('companyLogo') as string) || undefined,
      location: (data.get('location') as string) || '',
      type: (data.get('type') as RoleType) || 'Full-time',
      description: (data.get('description') as string) || '',
      deadline: (data.get('deadline') as string) || undefined,
      requiredSkills: parsedSkills,
      postedById: currentUser?.id,
      postedByName: currentUser?.name,
    };

    setJobs(prev => [newJob, ...prev]);
    setShowPostModal(false);
    setToastMessage('Job created successfully');
  }

  function handleApplySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedJob) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const rawApplicantSkills = (data.get('applicantSkills') as string) || '';
    const applicantSkills = rawApplicantSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const application = {
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      applicantName: currentUser?.name || 'Guest',
      applicantEmail: currentUser?.email || '',
      resumeLink: data.get('resume') as string,
      motivation: data.get('motivation') as string,
      applicantSkills,
      appliedAt: new Date().toISOString(),
    } as Application;

    // attach applicant id and company for easier display
    (application as any).applicantId = currentUser?.id;
    const jobObj = jobs.find(j => j.id === selectedJob.id);
    if (jobObj) application.company = jobObj.company;

    console.log('Job application submitted:', application);
    setApplications(prev => [application, ...prev]);
    setShowApplyModal(false);
    setSelectedJob(null);
    setToastMessage('Applied for job successfully');
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">Explore current job openings and apply directly or post opportunities if you're an alumni.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-50">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTab('list')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                tab === 'list' ? 'border-blue-500 text-blue-600' : 'border--gray-900 text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Find Jobs
              <span className="ml-2 bg-gray-10 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {filteredJobs.length}
              </span>
            </button>

            <button
              onClick={() => setTab('myApplications')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                tab === 'myApplications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Applications
              <span className="ml-2 bg-gray-0 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {applications.filter(a => a.applicantId === currentUser?.id).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Search & Filters */}
      {tab === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by title, company, location..."
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="w-40">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.role === 'alumni' && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowPostModal(true)}
                >
                  Post a Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          {filteredJobs.map(job => (
            <div key={job.id} className="border rounded p-4 flex flex-col md:flex-row md:items-start gap-4">
              <img src={job.companyLogo || 'https://via.placeholder.com/60'} alt={job.company} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="truncate">
                    <div className="font-semibold text-lg truncate">{job.title}</div>
                    <div className="text-sm text-gray-600 truncate">{job.company} • {job.location}</div>
                    {/* poster info */}
                    {job.postedByName && <div className="text-xs text-gray-500 mt-1">Posted by {job.postedByName}</div>}
                  </div>
                  <div className="text-sm px-2 py-1 bg-gray-100 rounded flex-shrink-0">{job.type}</div>
                </div>

                <p className="mt-3 text-sm">{job.description}</p>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.requiredSkills.map(skill => (
                      <span key={skill} className="text-xs bg-gray-200 px-2 py-1 rounded">{skill}</span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs text-gray-500">{job.deadline ? `Apply by ${job.deadline}` : 'No deadline'}</div>
                  <div className="text-xs text-gray-500">{job.postedByName ? `Posted by ${job.postedByName}` : 'No data'}</div>

                  <div className="flex items-center gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">No jobs found.</div>
          )}
        </div>
      )}

      {tab === 'myApplications' && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-3">My Applications</h3>
          {applications.filter(a => a.applicantId === currentUser?.id).length === 0 && (
            <div className="text-gray-500">You have not applied to any jobs yet.</div>
          )}

          <div className="space-y-3">
            {applications.filter(a => a.applicantId === currentUser?.id).map(app => (
              <div key={app.appliedAt} className="border rounded p-3">
                <div className="font-semibold">{app.jobTitle} <span className="text-sm text-gray-500">@ {app.company}</span></div>
                <div className="text-sm text-gray-600">Applied on {new Date(app.appliedAt).toLocaleString()}</div>
                {app.applicantSkills && app.applicantSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.applicantSkills.map(s => (
                      <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Post a Job</h3>
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <input name="title" placeholder="Job title" className="w-full border px-3 py-2 rounded" required />
              <input name="company" placeholder="Company name" className="w-full border px-3 py-2 rounded" required />
              <input name="companyLogo" placeholder="Company logo URL (optional)" className="w-full border px-3 py-2 rounded" />
              <input name="location" placeholder="Location" className="w-full border px-3 py-2 rounded" />
              <select name="type" className="w-full border px-3 py-2 rounded">
                <option>Full-time</option>
                <option>Internship</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
              <textarea name="description" placeholder="Short description" className="w-full border px-3 py-2 rounded" rows={3} />
              <input name="requiredSkills" placeholder="Required skills (comma-separated)" className="w-full border px-3 py-2 rounded" />
              <div> Deadline:
              <input name="deadline" type="date" className="w-full border px-3 py-2 rounded" /></div>

              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded border" onClick={() => setShowPostModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Apply to {selectedJob.title}</h3>
            <form onSubmit={handleApplySubmit} className="space-y-3">
              <input name="name" defaultValue={currentUser?.name || ''} className="w-full border px-3 py-2 rounded bg-gray-50" disabled />
              <input name="email" defaultValue={currentUser?.email || ''} className="w-full border px-3 py-2 rounded bg-gray-50" disabled />
              <input name="resume" placeholder="Resume link (URL)" className="w-full border px-3 py-2 rounded" required />
              <textarea name="motivation" placeholder="Introduce yourself in brief" className="w-full border px-3 py-2 rounded" rows={4} />
              <input name="applicantSkills" placeholder="Your skills (comma-separated)" className="w-full border px-3 py-2 rounded" />

              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded border" onClick={() => { setShowApplyModal(false); setSelectedJob(null); }}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}


