"use client";

import ResponseDisplay from "./ResponseDisplay";

export default function PlatformTransactionsTab({
  onFetchTransactions,
  response,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      page: formData.get("page"),
      limit: formData.get("limit"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
    };
    onFetchTransactions(data);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Platform Transactions
        </h3>
        <p className='text-sm text-gray-600 mb-4'>
          View all transactions across the platform, including transactions from
          all wallets.
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label
                htmlFor='page'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Page Number
              </label>
              <input
                type='number'
                id='page'
                name='page'
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='e.g., 1'
                min='1'
              />
            </div>
            <div>
              <label
                htmlFor='limit'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Items Per Page
              </label>
              <input
                type='number'
                id='limit'
                name='limit'
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='e.g., 10'
                min='1'
              />
            </div>
            <div>
              <label
                htmlFor='start_date'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Start Date
              </label>
              <input
                type='date'
                id='start_date'
                name='start_date'
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              />
            </div>
            <div>
              <label
                htmlFor='end_date'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                End Date
              </label>
              <input
                type='date'
                id='end_date'
                name='end_date'
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              />
            </div>
          </div>
          <button
            type='submit'
            className='inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <svg
              className='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Fetch Platform Transactions
          </button>
        </form>
      </div>

      {error && (
        <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
          <p className='text-sm text-red-700'>{error}</p>
        </div>
      )}

      {response && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>
            Platform Transactions
          </h4>
          <ResponseDisplay data={response} />
        </div>
      )}
    </div>
  );
}
