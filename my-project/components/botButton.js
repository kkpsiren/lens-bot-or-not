export function BotButton({ text }) {
  return (
    <button
      disabled={false}
      className="flex items-center justify-center w-64 h-10 p-2 mx-auto mt-2 mr-2 font-semibold text-center align-middle rounded-full bg-orb-500 hover:bg-orb-700 focus:border-yellow-50"
    >
      {text ? text : ""}
    </button>
  );
}
