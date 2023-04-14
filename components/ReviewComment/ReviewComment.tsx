import { FC, Key } from 'react'

type ReviewComment = {
    id: Key
    text: String
    reviewId: Key
    authorId: Key
}

const ReviewComment: FC = () => {
    return <>Review component</>
}

export default ReviewComment
