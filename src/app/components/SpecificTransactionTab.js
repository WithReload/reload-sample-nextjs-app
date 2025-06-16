"use client";

import ResponseDisplay from "./ResponseDisplay";

export default function SpecificTransactionTab({
  onFetchTransaction,
  response,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      transaction_id: formData.get("transaction_id"),
    };
    onFetchTransaction(data);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Specific Transaction
        </h3>
        <p className='text-sm text-gray-600 mb-4'>
          Look up detailed information about a specific transaction using its
          ID.
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='transaction_id'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Transaction ID
            </label>
            <input
              type='text'
              id='transaction_id'
              name='transaction_id'
              className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter the transaction ID'
              required
            />
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
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            Get Transaction
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
            Transaction Details
          </h4>
          <ResponseDisplay data={response} />
        </div>
      )}
    </div>
  );
}
