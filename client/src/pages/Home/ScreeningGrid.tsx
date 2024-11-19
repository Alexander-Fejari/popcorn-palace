import { useState, useEffect } from 'react';
import Typography from '@/components/common/Typography';
import Card from '@/components/common/Card';
import Pill from '@/components/common/Pill';
import Icon from '@/components/common/Icon';
import { IScreeningItem } from '@/types/types';
import { fetchScreenings } from '@/services/screening/fetchScreenings.service';
import {  formatSeances } from '@/utils/date.helpers';

interface ScreeningCardProps {
    path: string;
    title: string;
    poster: string;
    date: string;
    time: string;
    className?: string;
}

const ScreeningCard = ({
    path,
    title,
    poster,
    date,
    time,
    className = '',
}: ScreeningCardProps) => {
    return (
        <a
            href={`/screenings/${path}?time=${time}`}
            className={`${className} rounded-lg`}>
            <Card
                size='medium'
                className='flex flex-col justify-between h-full backdrop-blur hover:border-white/15 transition-all duration-100'>
                <img
                    className='w-full rounded'
                    src={poster}
                    alt={`Affiche du film ${title}`}
                />
                <Typography as='h3' variant='h5' className='text-center mt-4'>
                    {title}
                </Typography>
                <div className='mt-2 flex gap-2 justify-center items-center'>
                    <Pill type='dark'>{date}</Pill> {/* Affichage de la date */}
                    <Pill type='light'>{time}</Pill>
                </div>
            </Card>
        </a>
    );
};


const ScreeningGrid = () => {
    const [screeningsData, setScreeningsData] = useState<
        IScreeningItem[] | null
    >(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const screenings: IScreeningItem[] = await fetchScreenings(); // Typage du retour de fetchScreenings
                setScreeningsData(screenings);
                setLoading(false);
            } catch (error: any) {
                setError(error.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <section className='mt-16'>
            <Typography as='h2' variant='h2'>
                Nos prochaines projections
            </Typography>
            {loading ? (
                <div className='mt-8'>
                    <Icon
                        name='spinner'
                        className='w-8 h-8 animate-spin opacity-75'
                    />
                </div>
            ) : error ? (
                <div className='mt-8'>
                    Une erreur s'est produite lors du chargement des séances.
                </div>
            ) : (
                <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                    {screeningsData?.map((screening, index) => {
                        // Obtenez une combinaison date/heure unique pour chaque séance
                        const seances = formatSeances(
                            new Date(),
                            screeningsData.length
                        );
                        const { date, time } = seances[index % seances.length];

                        return (
                            <ScreeningCard
                                key={screening._id}
                                path={`${screening.slug}/${screening._id}`}
                                title={screening.movie.title}
                                poster={screening.movie.poster}
                                date={date} // Date au format string
                                time={time}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ScreeningGrid;
