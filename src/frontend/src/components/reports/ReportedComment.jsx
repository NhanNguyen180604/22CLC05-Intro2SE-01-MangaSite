import propTypes from "prop-types";
import { MdReply } from "react-icons/md";

const ReportedComment = function ({
  informant,
  description,
  comment,
  processed,
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <MdReply color="white" className="size-6" />
        <span>Comment reported by</span>
        <a
          href={`/user/${informant._id}`}
          className="flex flex-row items-center gap-2 hover:underline"
        >
          <img
            src={informant.avatar.url}
            alt={`Avatar of ${informant.name}`}
            className="size-6 rounded-full object-cover"
          />
          <span className="font-semibold">{informant.name}</span>
        </a>
      </div>

      <div className="flex w-full flex-row items-center">
        <span className="font-semibold">Reason</span>: {description}
      </div>

      <div
        className={`relative flex w-full flex-col gap-2 rounded-xl bg-medium-navy p-4 ${processed ? "opacity-50" : ""}`}
      >
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row items-center gap-2">
            <img
              src={comment.user.avatar.url}
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
    </div>
  );
};

ReportedComment.propTypes = {
  informant: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    avatar: propTypes.shape({
      url: propTypes.string,
    }),
  }),
  description: propTypes.string,
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
