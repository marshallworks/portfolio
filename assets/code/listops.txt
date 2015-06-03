module ListOps
    ( length
    , reverse
    , map
    , filter
    , foldr
    , foldl'
    , (++)
    , concat
    ) where

import Prelude hiding
    ( length, reverse, map, filter, foldr, (++), concat )

foldl' :: (b -> a -> b) -> b -> [a] -> b
foldl' _ start [] = start
foldl' f start (x:xs) = start' `seq` foldl' f start' xs
    where start' = f start x

foldr :: (a -> b -> b) -> b -> [a] -> b
foldr func start = foldElements
    where
        foldElements [] = start
        foldElements (x:xs) = x `func` foldElements xs

length :: [a] -> Int
length = foldl' (\ count _ -> count + 1) 0

reverse :: [a] -> [a]
reverse = foldl' (flip (:)) []

map :: (a -> b) -> [a] -> [b]
map f = foldr (\x xs -> f x : xs) []

filter :: (a -> Bool) -> [a] -> [a]
filter f = foldr (\x xs -> if f x then x : xs else xs) []

(++) :: [a] -> [a] -> [a]
first ++ second = foldr (:) second first

concat :: [[a]] -> [a]
concat = foldr (++) []