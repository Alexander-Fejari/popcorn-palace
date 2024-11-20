import {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {IBooking, IScreening, ITicket} from '@/types/types';
import {fetchScreening} from '@/services/screening/fetchScreening.service';
import {createBooking} from '@/services/booking/createBooking';
import Container from '@/components/layout/Container';
import Nav from '@/components/layout/Nav';
import AuthModal from '@/components/auth/AuthModal';
import Footer from '@/components/layout/Footer';
import BookingHeader from '@/components/ui/BookingHeader';
import BookingSteps from '@/components/ui/BookingSteps';
import BookingSummary from '@/components/ui/BookingSummary';
import AboutMovie from './AboutMovie';
import TicketSelection from './TicketSelection';
import SeatSelection from './SeatSelection';
import Loading from '@/components/layout/Loading';
import {formatSeances} from "@/utils/date.helpers.ts";

const Screening = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const time = queryParams.get('time') || '';

    const [loading, setLoading] = useState<boolean>(true);
    const [screeningData, setScreeningData] = useState<IScreening | null>(null);
    const [bookingData, setBookingData] = useState<IBooking>({
        screening_id: id!,
        tickets: [],
        seats: [],
    });
    const [formattedDate, setFormattedDate] = useState<string>(''); // État pour la date formatée

    useEffect(() => {
        const fetchData = async () => {
            try {
                const screeningData = await fetchScreening(id!);

                // Formater la date pour la cohérence avec ScreeningCard
                const seances = formatSeances(new Date(), 1); // Obtenir une date formatée
                const {date} = seances[0];

                setScreeningData({
                    ...screeningData,
                    formattedDate: date,
                });
                setFormattedDate(date); // Stocker la date formatée

                setLoading(false);
            } catch (error: any) {
                console.error("Erreur lors de la récupération des données de projection :", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const dateObject = new Date(formattedDate);

    const setTickets = (tickets: ITicket[]) => {
        if (tickets.length < bookingData.seats.length) {
            bookingData.seats.pop();
            setBookingData({
                ...bookingData,
                tickets: tickets,
                seats: bookingData.seats,
            });
        } else {
            setBookingData({
                ...bookingData,
                tickets: tickets,
            });
        }
    };

    const setSeats = (seats: string[]) => {
        setBookingData({
            ...bookingData,
            seats: seats,
        });
    };

    const goToPaymentPage = async () => {
        const bookingId = await createBooking(bookingData);
        navigate(`/payment?bookingid=${bookingId}&time=${time}`);
    };

    if (loading || !screeningData) return <Loading/>;

    return (
        <>
            <AuthModal/>
            <Container>
                <Nav/>
                <BookingHeader
                    title={screeningData.movie.title}
                    date={dateObject}
                    time={time}
                    backdrop={screeningData.movie.backdrop}
                    score={parseFloat(screeningData.movie.score)}
                    trailer={screeningData.movie.trailer}
                />

                <div className='grid grid-cols-3 gap-4 mt-12'>
                    <div className='flex flex-col gap-4 col-span-3 order-2 lg:col-span-2 lg:row-span-3 lg:order-1'>
                        <AboutMovie
                            director={screeningData.movie.director}
                            casting={screeningData.movie.casting}
                            synopsis={screeningData.movie.synopsis}
                            genres={screeningData.movie.genres}
                        />
                        <TicketSelection
                            tickets={bookingData.tickets}
                            setTickets={setTickets}
                        />
                        <SeatSelection
                            selectedSeats={bookingData.seats}
                            numberToSelect={bookingData.tickets.length}
                            bookedSeats={screeningData.bookedSeats}
                            setSeats={setSeats}
                        />
                    </div>

                    <div className='col-span-3 order-1 lg:col-span-1 lg:order-2'>
                        <BookingSteps step={1}/>
                    </div>

                    <div className='col-span-3 order -3 lg:col-span-1 lg:order-3 lg:sticky lg:top-4'>
                        <BookingSummary
                            booking={bookingData}
                            buttonLabel='Suivant'
                            disabled={
                                bookingData?.tickets.length === 0 ||
                                bookingData.tickets.length !== bookingData.seats.length
                            }
                            buttonAction={goToPaymentPage}
                        />
                    </div>
                </div>

                <Footer/>
            </Container>
        </>
    );
};

export default Screening;
