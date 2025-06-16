export default function ResponseDisplay({ data, error }) {
  if (error) {
    return (
      <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
        <h3 className='text-red-800 font-semibold mb-2'>Error</h3>
        <pre className='text-red-600 text-sm whitespace-pre-wrap overflow-x-auto'>
          {error}
        </pre>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
      <h3 className='text-gray-800 font-semibold mb-2'>Response</h3>
      <pre className='text-gray-600 text-sm whitespace-pre-wrap overflow-x-auto'>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
