"use client";

import ResponseDisplay from "./ResponseDisplay";

export default function PreviewChargeTab({ onPreviewCharge, response, error }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      amount: formData.get("amount"),
      amount_type: formData.get("amount_type"),
      ...(formData.get("ai_agent_id") && {
        ai_agent_id: formData.get("ai_agent_id"),
      }),
      ...(formData.get("idempotency_key") && {
        idempotency_key: formData.get("idempotency_key"),
      }),
    };
    onPreviewCharge(data);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Preview Charge
        </h3>
        <p className='text-sm text-gray-600 mb-4'>
          Preview a charge before executing it. This will show you the estimated
          costs and any potential fees.
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
          <div>
            <label
              htmlFor='idempotency_key'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Idempotency Key (Optional - auto generated on the backend before
              calling API if not provided)
            </label>
            <input
              type='text'
              id='idempotency_key'
              name='idempotency_key'
              className='block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter idempotency key to prevent duplicate charges'
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
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
            Preview
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
            Preview Result
          </h4>
          <ResponseDisplay data={response} />
        </div>
      )}
    </div>
  );
}
