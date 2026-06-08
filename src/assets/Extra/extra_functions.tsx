
export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div style={{ display: 'flex', gap: '2px', color: 'gold' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};