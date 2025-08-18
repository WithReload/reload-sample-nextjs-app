"use client";

import ResponseDisplay from "./ResponseDisplay";

export default function ChargeTab({ onCharge, response, error }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      amount: formData.get("amount"),
      amount_type: formData.get("amount_type"),
      usage_details: {
        description: formData.get("description"),
      },
      ...(formData.get("ai_agent_id") && { ai_agent_id: formData.get("ai_agent_id") }),
    };
    onCharge(data);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Charge Wallet
        </h3>
        <p className='text-sm text-gray-600 mb-4'>
          Execute a charge on the wallet. Make sure to preview the charge first
          to understand the costs.
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='amount'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Amount
              </label>
              <input
                type='number'
                id='amount'
                name='amount'
                required
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='Enter amount'
                min='0'
                step='0.01'
              />
            </div>
            <div>
              <label
                htmlFor='amount_type'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Amount Type
              </label>
              <select
                id='amount_type'
                name='amount_type'
                required
                className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              >
                <option value='platform_credits'>Platform Credits</option>
                <option value='usd'>USD</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Description (Optional)
            </label>
            <input
              type='text'
              id='description'
              name='description'
              className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter a description for this charge'
            />
          </div>
          <div>
            <label
              htmlFor='ai_agent_id'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              AI Agent ID (Optional)
            </label>
            <input
              type='text'
              id='ai_agent_id'
              name='ai_agent_id'
              className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter AI agent ID for tracking'
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
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Charge
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
            Charge Result
          </h4>
          <ResponseDisplay data={response} />
        </div>
      )}
    </div>
  );
}
