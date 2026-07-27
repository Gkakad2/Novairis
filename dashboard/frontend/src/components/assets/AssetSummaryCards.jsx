import {
    Server,
    Monitor,
    Laptop,
    ShieldCheck,
    XCircle
} from "lucide-react";

export default function AssetSummaryCards({ summary }) {

    const cards = [

        {
            title: "Total Hosts",
            value: summary?.total_hosts ?? 0,
            icon: Server,
            color: "text-cyan-400",
        },

        {
            title: "Online",
            value: summary?.online ?? 0,
            icon: ShieldCheck,
            color: "text-green-400",
        },

        {
            title: "Offline",
            value: summary?.offline ?? 0,
            icon: XCircle,
            color: "text-red-400",
        },

        {
            title: "Linux",
            value: summary?.linux ?? 0,
            icon: Laptop,
            color: "text-yellow-400",
        },

        {
            title: "Windows",
            value: summary?.windows ?? 0,
            icon: Monitor,
            color: "text-blue-400",
        }

    ];

    return (

        <div className="grid grid-cols-5 gap-5">

            {cards.map(card => {

                const Icon = card.icon;

                return (

                    <div
                        key={card.title}
                        className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg"
                    >

                        <div className="flex justify-between items-center">

                            <div>

                                <p className="text-sm text-slate-400">
                                    {card.title}
                                </p>

                                <h1 className="mt-2 text-3xl font-bold">
                                    {card.value}
                                </h1>

                            </div>

                            <Icon
                                size={34}
                                className={card.color}
                            />

                        </div>

                    </div>

                );

            })}

        </div>

    );

}
