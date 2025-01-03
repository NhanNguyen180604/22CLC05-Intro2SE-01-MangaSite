import propTypes from "prop-types";

const ReportedComment = function ({ comment, processed }) {
  return (
    <div
      className={`relative flex w-full flex-col gap-2 rounded-xl bg-medium-navy p-4 ${processed ? "opacity-50" : ""}`}
    >
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <img
            src={comment.user.avatar?.url || 'https://placehold.co/30x30?text=User+Avatar'}
            alt={`Avatar of ${comment.user.name}`}
            className="size-5 rounded-full"
          />
          <span className="text-sm font-semibold">{comment.user.name}</span>
        </div>

        <span className="text-sm font-semibold text-white/50">
          {comment.user.email}
        </span>
      </div>

      <p className="whitespace-break-spaces">{comment.content}</p>
      <p className="w-full shrink-0 text-right font-semibold text-white/50">
        {new Date(comment.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

ReportedComment.propTypes = {
  comment: propTypes.shape({
    user: propTypes.shape({
      name: propTypes.string,
      email: propTypes.string,
      avatar: propTypes.shape({
        url: propTypes.string,
      }),
    }),
    content: propTypes.string,
    createdAt: propTypes.any,
  }),
  processed: propTypes.bool,
};

export default ReportedComment;
