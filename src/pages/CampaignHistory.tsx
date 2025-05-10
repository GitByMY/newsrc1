import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Campaign } from '../types';
import { campaignApi } from '../services/api';

const CampaignHistory: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignApi.getAll();
        setCampaigns(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns from database');
        // Use empty array if fetch fails
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedCampaigns = () => {
    let filteredCampaigns = [...campaigns];
    
    // Filter by search term
    if (searchTerm) {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filteredCampaigns.sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
    
    return filteredCampaigns;
  };

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'percent', 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  };

  const sortedCampaigns = getSortedCampaigns();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
      </div>

      {/* Search */}
      <div className="bg-white shadow-soft rounded-lg p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search campaigns..."
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        /* Campaign List */
        <div className="bg-white shadow-soft rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Campaign</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('audienceSize')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Audience</span>
                      {sortField === 'audienceSize' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('deliveryRatio')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Delivery Rate</span>
                      {sortField === 'deliveryRatio' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCampaigns.length > 0 ? (
                  sortedCampaigns.map((campaign) => (
                    <React.Fragment key={campaign._id}>
                      <tr className={`hover:bg-gray-50 ${expandedCampaign === campaign._id ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-500">{formatDate(campaign.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.audienceSize || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary-600 h-2.5 rounded-full" 
                                style={{ width: `${(campaign.deliveryRatio || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {formatPercentage(campaign.deliveryRatio || 0)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              campaign.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}
                          >
                            <div className="flex items-center">
                              {campaign.status === 'completed' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : campaign.status === 'in-progress' ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {campaign.status}
                            </div>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setExpandedCampaign(expandedCampaign === campaign._id ? null : campaign._id)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {expandedCampaign === campaign._id ? 'Hide Details' : 'Show Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedCampaign === campaign._id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {campaign.summary && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Summary:</h4>
                                  <p className="text-sm text-gray-600">{campaign.summary}</p>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Targeting Rules:</h4>
                                <div className="space-y-2">
                                  {campaign.audienceQuery?.map((rule, idx) => (
                                    <div key={idx} className="flex items-center text-sm">
                                      <span className="px-2 py-1 bg-gray-200 rounded text-gray-700 mr-2">
                                        {rule.field}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-200 rounded text-gray-700 mr-2">
                                        {rule.operator}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-200 rounded text-gray-700">
                                        {rule.value}
                                      </span>
                                      {rule.logicGate && (
                                        <span className="ml-2 px-2 py-1 bg-primary-100 rounded text-primary-700">
                                          {rule.logicGate}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                  <div className="text-sm font-medium text-gray-500">Audience Size</div>
                                  <div className="text-2xl font-semibold text-gray-800">{campaign.audienceSize || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                  <div className="text-sm font-medium text-gray-500">Successfully Sent</div>
                                  <div className="text-2xl font-semibold text-green-600">{campaign.sentCount || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                  <div className="text-sm font-medium text-gray-500">Failed</div>
                                  <div className="text-2xl font-semibold text-red-600">{campaign.failedCount || 0}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;