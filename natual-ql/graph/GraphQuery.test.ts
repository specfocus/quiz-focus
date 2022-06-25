import { GraphQuery } from './GraphQuery'
/*
{
  user( id:3500401 ) {
     id,
     nickname : name,
     isViewerFriend,
 
     image: profilePicture( size:50 ) {
         uri,
         width,
         height
     }
   }
 }
 */
 
 const profilePicture = new GraphQuery('profilePicture', {size: 50})
     .select('uri', 'width', 'height');
 
 const user = new GraphQuery('user', {id: 3500401})
     .select('id', {'nickname': 'name'}, 'isViewerFriend', {'image': profilePicture});
 
 
 console.log('user', user.toString());