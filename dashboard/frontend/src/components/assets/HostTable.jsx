export default function HostTable({ hosts, onSelect }) {

    return (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-bold">
                Host Inventory
            </h2>

            <table className="w-full">

                <thead>

                    <tr className="text-slate-400 border-b border-slate-700">

                        <th className="text-left py-3">Hostname</th>
                        <th className="text-left">IP</th>
                        <th className="text-left">OS</th>
                        <th className="text-left">CPU</th>
                        <th className="text-left">Memory</th>
                        <th className="text-left">Status</th>

                    </tr>

                </thead>

                <tbody>

                    {hosts.map(host => (

                        <tr

                            key={host.hostname}

                            onClick={() => onSelect(host)}

                            className="cursor-pointer border-b border-slate-800 hover:bg-slate-800"

                        >

                            <td className="py-4">{host.hostname}</td>

                            <td>{host.ip}</td>

                            <td>{host.os}</td>

                            <td>{host.cpu}%</td>

                            <td>{host.memory}%</td>

                            <td>

                                <span
                                    className={`font-semibold ${
                                        host.status === "Online"
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {host.status}
                                </span>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}
