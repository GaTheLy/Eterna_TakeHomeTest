import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Folder, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import classNames from 'classnames';
import ProjectFormModal from '../components/ProjectFormModal';
import { useDebounce } from '../hooks/useDebounce';
import { StatusBadge, Button, LoadingSpinner } from '../components/ui';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const fetchProjects = useCallback(async (page: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await api.get('/projects', {
        params: {
          page,
          limit: 9,
          search: searchQuery || undefined,
        }
      });
      setProjects(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(1, debouncedSearch);
  }, [debouncedSearch, fetchProjects]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchProjects(newPage, debouncedSearch);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            New Project
          </Button>
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center bg-white rounded-lg shadow px-6 py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try adjusting your search query.' : 'Get started by creating a new project.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col border border-transparent hover:border-indigo-200"
              >
                <div className="px-4 py-5 sm:p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} type="project" />
                  </div>
                  <div className="mt-2 text-sm text-gray-500 line-clamp-3">
                    <p>{project.description}</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 mt-auto flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs font-medium text-indigo-600">View Details →</div>
                </div>
              </Link>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(meta.page * meta.limit, meta.total)}
                    </span> of <span className="font-medium">{meta.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={meta.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={classNames(
                          'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0',
                          meta.page === pageNum
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        )}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProjects(1, search);
        }}
      />
    </div>
  );
}
